import { Injectable, NotFoundException, UnprocessableEntityException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagesService {
    constructor(private prisma: PrismaService) { }

    async findByConversation(conversationId: string, cursor?: string, limit = 30) {
        const where: any = { conversationId };
        if (cursor) where.createdAt = { lt: new Date(cursor) };

        const messages = await this.prisma.message.findMany({
            where,
            take: limit + 1,
            orderBy: { createdAt: 'desc' },
            include: {
                sender: { select: { id: true, name: true, avatarUrl: true } },
                attachments: true,
            },
        });

        const hasMore = messages.length > limit;
        const items = hasMore ? messages.slice(0, limit) : messages;

        return { data: items.reverse(), hasMore, nextCursor: hasMore ? items[0].createdAt.toISOString() : null };
    }

    async sendMessage(companyId: string, conversationId: string, senderId: string, data: {
        content?: string; contentType?: string; isInternal?: boolean;
    }) {
        const conv = await this.prisma.conversation.findFirst({
            where: { id: conversationId, companyId },
            include: { messages: { where: { direction: 'inbound' }, orderBy: { createdAt: 'desc' }, take: 1 } },
        });
        if (!conv) throw new NotFoundException('Conversa não encontrada');

        // Check lock
        if (conv.lockedByUserId && conv.lockedByUserId !== senderId) {
            const lockAge = conv.lockedAt ? (Date.now() - new Date(conv.lockedAt).getTime()) / 1000 : 999;
            if (lockAge < 120) throw new ConflictException('Conversa bloqueada por outro atendente');
        }

        const isInternal = data.isInternal || false;

        // Check 24h window for non-internal outbound messages
        if (!isInternal && data.contentType !== 'template') {
            const lastInbound = conv.messages[0];
            if (lastInbound) {
                const elapsed = (Date.now() - new Date(lastInbound.createdAt).getTime()) / 1000;
                if (elapsed > 86400) {
                    throw new UnprocessableEntityException('Janela de 24h fechada. Use um template para iniciar nova conversa.');
                }
            }
        }

        const message = await this.prisma.message.create({
            data: {
                conversationId,
                companyId,
                senderId,
                senderType: 'user',
                direction: isInternal ? 'outbound' : 'outbound',
                contentType: data.contentType || 'text',
                content: data.content,
                status: isInternal ? 'delivered' : 'queued',
                isInternal,
            },
            include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
        });

        // Update conversation
        const updateData: any = { lastMessageAt: new Date(), lastActivityAt: new Date() };
        if (!conv.firstReplyAt && !isInternal) {
            updateData.firstReplyAt = new Date();
        }

        await this.prisma.conversation.update({
            where: { id: conversationId },
            data: updateData,
        });

        return message;
    }

    async sendTemplate(companyId: string, conversationId: string, senderId: string, data: {
        templateId: string; language?: string; components?: any;
    }) {
        const template = await this.prisma.whatsAppTemplate.findFirst({
            where: { id: data.templateId, companyId, status: 'approved' },
        });
        if (!template) throw new NotFoundException('Template não encontrado ou não aprovado');

        const message = await this.prisma.message.create({
            data: {
                conversationId,
                companyId,
                senderId,
                senderType: 'user',
                direction: 'outbound',
                contentType: 'template',
                content: template.name,
                contentAttributes: { templateId: data.templateId, components: data.components, language: data.language || template.language },
                status: 'queued',
                isInternal: false,
            },
        });

        await this.prisma.conversation.update({
            where: { id: conversationId },
            data: { lastMessageAt: new Date(), lastActivityAt: new Date() },
        });

        return message;
    }

    async updateMessageStatus(waMessageId: string, companyId: string, newStatus: string) {
        const statusOrder = ['queued', 'sent', 'delivered', 'read'];
        const message = await this.prisma.message.findFirst({
            where: { waMessageId, companyId },
        });
        if (!message) return null;

        const currentIdx = statusOrder.indexOf(message.status);
        const newIdx = statusOrder.indexOf(newStatus);
        if (newIdx <= currentIdx) return message; // Never regress

        return this.prisma.message.update({
            where: { id: message.id },
            data: { status: newStatus },
        });
    }
}
