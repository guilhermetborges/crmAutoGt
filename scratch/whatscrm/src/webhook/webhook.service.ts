import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { ContactsService } from '../contacts/contacts.service';
import { ConversationsService } from '../conversations/conversations.service';
import { MessagesService } from '../messages/messages.service';
import { ChannelsService } from '../channels/channels.service';
import { EventsGateway } from '../gateway/events.gateway';

@Injectable()
export class WebhookService {
    private readonly logger = new Logger(WebhookService.name);

    constructor(
        private prisma: PrismaService,
        private contactsService: ContactsService,
        private conversationsService: ConversationsService,
        private messagesService: MessagesService,
        private channelsService: ChannelsService,
        private eventsGateway: EventsGateway,
    ) { }

    async verifyWebhook(channelId: string, mode: string, token: string, challenge: string) {
        if (mode !== 'subscribe') throw new BadRequestException('Invalid mode');
        const channel = await this.prisma.whatsAppChannel.findUnique({ where: { id: channelId } });
        if (!channel || channel.verifyToken !== token) throw new BadRequestException('Invalid verify token');
        return challenge;
    }

    validateSignature(payload: string, signature: string, appSecret: string): boolean {
        const expectedSig = crypto.createHmac('sha256', appSecret).update(payload).digest('hex');
        return `sha256=${expectedSig}` === signature;
    }

    async processWebhook(channelId: string, body: any) {
        const startTime = Date.now();

        try {
            const channel = await this.prisma.whatsAppChannel.findUnique({ where: { id: channelId } });
            if (!channel) {
                this.logger.warn(`Channel not found: ${channelId}`);
                return;
            }

            for (const entry of body.entry || []) {
                for (const change of entry.changes || []) {
                    const value = change.value;
                    if (!value) continue;

                    if (value.messages) {
                        for (const msg of value.messages) {
                            await this.processInboundMessage(channel, value, msg);
                        }
                    }

                    if (value.statuses) {
                        for (const status of value.statuses) {
                            await this.processStatusUpdate(channel, status);
                        }
                    }
                }
            }

            await this.prisma.integrationLog.create({
                data: {
                    companyId: channel.companyId,
                    channelId: channel.id,
                    direction: 'inbound',
                    endpoint: '/webhooks/whatsapp',
                    statusCode: 200,
                    payloadSummary: this.truncatePayload(body),
                    latencyMs: Date.now() - startTime,
                },
            });
        } catch (error) {
            this.logger.error(`Webhook processing error: ${error.message}`, error.stack);

            await this.prisma.integrationLog.create({
                data: {
                    companyId: 'unknown',
                    direction: 'inbound',
                    endpoint: '/webhooks/whatsapp',
                    statusCode: 500,
                    error: error.message,
                    latencyMs: Date.now() - startTime,
                },
            }).catch(() => { });
        }
    }

    private async processInboundMessage(channel: any, value: any, msg: any) {
        // Idempotency check
        const existing = await this.prisma.message.findFirst({
            where: { waMessageId: msg.id, companyId: channel.companyId },
        });
        if (existing) {
            this.logger.debug(`Duplicate message skipped: ${msg.id}`);
            return;
        }

        // Find or create contact
        const contactInfo = value.contacts?.[0];
        const contact = await this.contactsService.findOrCreateByWaId(
            channel.companyId, msg.from, msg.from, contactInfo?.profile?.name,
        );

        await this.prisma.contact.update({
            where: { id: contact.id },
            data: { lastActivityAt: new Date() },
        });

        // Find or create conversation
        let conversation = await this.prisma.conversation.findFirst({
            where: {
                companyId: channel.companyId,
                contactId: contact.id,
                channelId: channel.id,
                status: { notIn: ['archived'] },
            },
            orderBy: { createdAt: 'desc' },
        });

        if (!conversation) {
            const displayId = await this.conversationsService.getNextDisplayId(channel.companyId);
            conversation = await this.prisma.conversation.create({
                data: {
                    companyId: channel.companyId,
                    channelId: channel.id,
                    contactId: contact.id,
                    displayId,
                    status: 'open',
                    lastMessageAt: new Date(),
                    lastActivityAt: new Date(),
                },
            });
            this.eventsGateway.emitToCompany(channel.companyId, 'conversation_created', conversation);
        } else if (conversation.status === 'resolved') {
            conversation = await this.prisma.conversation.update({
                where: { id: conversation.id },
                data: { status: 'open', lastActivityAt: new Date(), assigneeId: null, lockedByUserId: null },
            });
        }

        // Extract content
        const { content, contentType } = this.extractContent(msg);

        // Create message
        const message = await this.prisma.message.create({
            data: {
                conversationId: conversation.id,
                companyId: channel.companyId,
                senderType: 'contact',
                direction: 'inbound',
                contentType,
                content,
                waMessageId: msg.id,
                status: 'delivered',
                contentAttributes: msg[msg.type] || {},
            },
        });

        await this.prisma.conversation.update({
            where: { id: conversation.id },
            data: { lastMessageAt: new Date(), lastActivityAt: new Date(), customerLastSeenAt: new Date() },
        });

        // Emit WebSocket events
        this.eventsGateway.emitToCompany(channel.companyId, 'new_message', {
            conversationId: conversation.id,
            message,
        });

        if (conversation.sectorId) {
            this.eventsGateway.emitToSector(conversation.sectorId, 'new_message', {
                conversationId: conversation.id,
                message,
            });
        }
    }

    private async processStatusUpdate(channel: any, status: any) {
        const updated = await this.messagesService.updateMessageStatus(
            status.id, channel.companyId, status.status,
        );
        if (updated) {
            this.eventsGateway.emitToCompany(channel.companyId, 'message_status_updated', {
                messageId: updated.id,
                status: status.status,
            });
        }
    }

    private extractContent(msg: any): { content: string; contentType: string } {
        const type = msg.type;
        switch (type) {
            case 'text': return { content: msg.text?.body || '', contentType: 'text' };
            case 'image': return { content: msg.image?.caption || '[Imagem]', contentType: 'image' };
            case 'audio': return { content: '[Áudio]', contentType: 'audio' };
            case 'video': return { content: msg.video?.caption || '[Vídeo]', contentType: 'video' };
            case 'document': return { content: msg.document?.filename || '[Documento]', contentType: 'document' };
            case 'location': return { content: `[Localização: ${msg.location?.latitude},${msg.location?.longitude}]`, contentType: 'location' };
            case 'sticker': return { content: '[Sticker]', contentType: 'sticker' };
            default: return { content: `[${type}]`, contentType: type };
        }
    }

    private truncatePayload(body: any): any {
        const str = JSON.stringify(body);
        if (str.length > 1024) return JSON.parse(str.slice(0, 1024) + '..."}');
        return body;
    }
}
