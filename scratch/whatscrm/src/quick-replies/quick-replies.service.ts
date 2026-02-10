import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuickRepliesService {
    constructor(private prisma: PrismaService) { }

    async findAll(companyId: string, query?: string) {
        const where: any = { companyId };
        if (query) where.shortcode = { contains: query, mode: 'insensitive' };
        return this.prisma.quickReply.findMany({ where, orderBy: { shortcode: 'asc' } });
    }

    async create(companyId: string, userId: string, data: { shortcode: string; content: string }) {
        return this.prisma.quickReply.create({ data: { companyId, createdById: userId, ...data } });
    }

    async update(companyId: string, id: string, data: { shortcode?: string; content?: string }) {
        const qr = await this.prisma.quickReply.findFirst({ where: { id, companyId } });
        if (!qr) throw new NotFoundException('Resposta rápida não encontrada');
        return this.prisma.quickReply.update({ where: { id }, data });
    }

    async delete(companyId: string, id: string) {
        const qr = await this.prisma.quickReply.findFirst({ where: { id, companyId } });
        if (!qr) throw new NotFoundException('Resposta rápida não encontrada');
        return this.prisma.quickReply.delete({ where: { id } });
    }
}
