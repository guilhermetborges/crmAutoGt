import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class ChannelsService {
    constructor(private prisma: PrismaService) { }

    private encrypt(text: string): string {
        const key = Buffer.from(process.env.ENCRYPTION_KEY || '', 'hex');
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = cipher.getAuthTag().toString('hex');
        return `${iv.toString('hex')}:${authTag}:${encrypted}`;
    }

    decrypt(encryptedText: string): string {
        const key = Buffer.from(process.env.ENCRYPTION_KEY || '', 'hex');
        const [ivHex, authTagHex, encrypted] = encryptedText.split(':');
        const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(ivHex, 'hex'));
        decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }

    async findAll(companyId: string) {
        return this.prisma.whatsAppChannel.findMany({
            where: { companyId },
            select: {
                id: true, phoneNumber: true, phoneNumberId: true, wabaId: true,
                businessName: true, active: true, createdAt: true,
            },
        });
    }

    async findOne(companyId: string, id: string) {
        const channel = await this.prisma.whatsAppChannel.findFirst({ where: { id, companyId } });
        if (!channel) throw new NotFoundException('Canal não encontrado');
        return channel;
    }

    async create(companyId: string, data: {
        phoneNumber: string; phoneNumberId: string; wabaId: string;
        accessToken: string; businessName?: string;
    }) {
        const verifyToken = crypto.randomBytes(32).toString('hex');
        return this.prisma.whatsAppChannel.create({
            data: {
                companyId,
                phoneNumber: data.phoneNumber,
                phoneNumberId: data.phoneNumberId,
                wabaId: data.wabaId,
                businessName: data.businessName,
                encryptedAccessToken: this.encrypt(data.accessToken),
                verifyToken,
            },
        });
    }

    async update(companyId: string, id: string, data: any) {
        await this.findOne(companyId, id);
        if (data.accessToken) {
            data.encryptedAccessToken = this.encrypt(data.accessToken);
            delete data.accessToken;
        }
        return this.prisma.whatsAppChannel.update({ where: { id }, data });
    }

    async getAccessToken(channelId: string): Promise<string> {
        const channel = await this.prisma.whatsAppChannel.findUnique({ where: { id: channelId } });
        if (!channel) throw new NotFoundException('Canal não encontrado');
        return this.decrypt(channel.encryptedAccessToken);
    }

    async findByPhoneNumberId(phoneNumberId: string) {
        return this.prisma.whatsAppChannel.findFirst({ where: { phoneNumberId } });
    }
}
