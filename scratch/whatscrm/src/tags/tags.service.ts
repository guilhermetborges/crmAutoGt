import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TagsService {
    constructor(private prisma: PrismaService) { }

    async findAll(companyId: string) {
        return this.prisma.tag.findMany({
            where: { companyId },
            include: { _count: { select: { conversationTags: true } } },
            orderBy: { name: 'asc' },
        });
    }

    async create(companyId: string, data: { name: string; color?: string }) {
        return this.prisma.tag.create({ data: { companyId, ...data } });
    }

    async update(companyId: string, id: string, data: { name?: string; color?: string }) {
        const tag = await this.prisma.tag.findFirst({ where: { id, companyId } });
        if (!tag) throw new NotFoundException('Tag não encontrada');
        return this.prisma.tag.update({ where: { id }, data });
    }

    async delete(companyId: string, id: string) {
        const tag = await this.prisma.tag.findFirst({ where: { id, companyId } });
        if (!tag) throw new NotFoundException('Tag não encontrada');
        return this.prisma.tag.delete({ where: { id } });
    }

    async addToConversation(companyId: string, conversationId: string, tagId: string) {
        return this.prisma.conversationTag.create({ data: { conversationId, tagId, companyId } });
    }

    async removeFromConversation(conversationId: string, tagId: string) {
        const link = await this.prisma.conversationTag.findFirst({ where: { conversationId, tagId } });
        if (!link) throw new NotFoundException('Tag não vinculada');
        return this.prisma.conversationTag.delete({ where: { id: link.id } });
    }
}
