import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContactsService {
    constructor(private prisma: PrismaService) { }

    async findAll(companyId: string, query?: string, cursor?: string, limit = 25) {
        const where: any = { companyId };
        if (query) where.OR = [
            { name: { contains: query, mode: 'insensitive' } },
            { phoneNumber: { contains: query } },
        ];
        if (cursor) where.id = { lt: cursor };

        const contacts = await this.prisma.contact.findMany({
            where, take: limit + 1, orderBy: { lastActivityAt: 'desc' },
            include: { _count: { select: { conversations: true } } },
        });

        const hasMore = contacts.length > limit;
        return { data: hasMore ? contacts.slice(0, limit) : contacts, hasMore };
    }

    async findOne(companyId: string, id: string) {
        const contact = await this.prisma.contact.findFirst({
            where: { id, companyId },
            include: { conversations: { orderBy: { createdAt: 'desc' }, take: 10, select: { id: true, displayId: true, status: true, lastMessageAt: true } } },
        });
        if (!contact) throw new NotFoundException('Contato não encontrado');
        return contact;
    }

    async update(companyId: string, id: string, data: { name?: string; customAttributes?: any }) {
        await this.findOne(companyId, id);
        return this.prisma.contact.update({ where: { id }, data });
    }

    async anonymize(companyId: string, id: string) {
        const existingContact = await this.findOne(companyId, id);
        const crypto = await import('crypto');

        await this.prisma.contact.update({
            where: { id },
            data: {
                name: 'ANONIMIZADO',
                phoneNumber: crypto.createHash('sha256').update(existingContact.phoneNumber).digest('hex').slice(0, 20),
                waId: crypto.createHash('sha256').update(existingContact.waId).digest('hex').slice(0, 50),
                profilePictureUrl: null,
                customAttributes: {},
            },
        });

        await this.prisma.message.updateMany({
            where: { conversation: { contactId: id } },
            data: { content: '[CONTEÚDO REMOVIDO POR SOLICITAÇÃO LGPD]', contentAttributes: {} },
        });
        return { message: 'Contato anonimizado com sucesso' };
    }

    async findOrCreateByWaId(companyId: string, waId: string, phoneNumber: string, name?: string) {
        let contact = await this.prisma.contact.findFirst({ where: { companyId, waId } });
        if (!contact) {
            contact = await this.prisma.contact.create({
                data: { companyId, waId, phoneNumber, name: name || '' },
            });
        } else if (name && contact.name !== name) {
            contact = await this.prisma.contact.update({ where: { id: contact.id }, data: { name } });
        }
        return contact;
    }
}
