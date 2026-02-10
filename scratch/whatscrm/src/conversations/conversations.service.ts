import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConversationsService {
    constructor(private prisma: PrismaService) { }

    async findAll(companyId: string, userRole: string, userSectorIds: string[], filters: {
        status?: string; sectorId?: string; assigneeId?: string;
        tagId?: string; contactQuery?: string; cursor?: string; limit?: number;
    }) {
        const limit = Math.min(filters.limit || 25, 50);
        const where: any = { companyId };

        // Sector isolation for non-admin users
        if (userRole !== 'admin') {
            where.sectorId = { in: userSectorIds };
        }

        if (filters.status) {
            where.status = { in: filters.status.split(',') };
        }
        if (filters.sectorId) where.sectorId = filters.sectorId;
        if (filters.assigneeId) where.assigneeId = filters.assigneeId;
        if (filters.tagId) {
            where.tags = { some: { tagId: filters.tagId } };
        }
        if (filters.contactQuery) {
            where.contact = { name: { contains: filters.contactQuery, mode: 'insensitive' } };
        }
        if (filters.cursor) {
            where.id = { lt: filters.cursor };
        }

        const conversations = await this.prisma.conversation.findMany({
            where,
            take: limit + 1,
            orderBy: { lastActivityAt: 'desc' },
            include: {
                contact: { select: { id: true, name: true, phoneNumber: true, profilePictureUrl: true } },
                sector: { select: { id: true, name: true, color: true } },
                assignee: { select: { id: true, name: true, avatarUrl: true } },
                tags: { include: { tag: true } },
                messages: { orderBy: { createdAt: 'desc' }, take: 1, select: { content: true, contentType: true, createdAt: true, direction: true } },
            },
        });

        const hasMore = conversations.length > limit;
        const items = hasMore ? conversations.slice(0, limit) : conversations;

        return {
            data: items,
            hasMore,
            nextCursor: hasMore ? items[items.length - 1].id : null,
        };
    }

    async findOne(companyId: string, id: string) {
        const conversation = await this.prisma.conversation.findFirst({
            where: { id, companyId },
            include: {
                contact: true,
                sector: true,
                assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
                lockedBy: { select: { id: true, name: true } },
                tags: { include: { tag: true } },
                channel: { select: { id: true, phoneNumber: true, businessName: true } },
            },
        });
        if (!conversation) throw new NotFoundException('Conversa não encontrada');
        return conversation;
    }

    async updateStatus(companyId: string, id: string, status: string, userId: string) {
        const conv = await this.findOne(companyId, id);
        const data: any = { status, lastActivityAt: new Date() };
        if (status === 'resolved') data.resolvedAt = new Date();
        if (status === 'open') { data.assigneeId = null; data.lockedByUserId = null; data.lockedAt = null; }

        return this.prisma.conversation.update({ where: { id }, data });
    }

    async assign(companyId: string, id: string, assigneeId: string) {
        const conv = await this.findOne(companyId, id);
        if (conv.lockedByUserId && conv.lockedByUserId !== assigneeId) {
            const lockAge = conv.lockedAt ? (Date.now() - new Date(conv.lockedAt).getTime()) / 1000 : 999;
            if (lockAge < 120) throw new ConflictException('Conversa bloqueada por outro atendente');
        }

        return this.prisma.conversation.update({
            where: { id },
            data: {
                assigneeId,
                status: 'in_progress',
                lockedByUserId: assigneeId,
                lockedAt: new Date(),
                lastActivityAt: new Date(),
            },
        });
    }

    async transfer(companyId: string, id: string, data: {
        toUserId?: string; toSectorId?: string; reason: string;
    }, fromUserId: string) {
        const conv = await this.findOne(companyId, id);

        await this.prisma.conversationTransfer.create({
            data: {
                conversationId: id,
                companyId,
                fromUserId,
                toUserId: data.toUserId || null,
                fromSectorId: conv.sectorId,
                toSectorId: data.toSectorId || conv.sectorId,
                reason: data.reason,
            },
        });

        const updateData: any = { lastActivityAt: new Date(), lockedByUserId: null, lockedAt: null };

        if (data.toSectorId) {
            updateData.sectorId = data.toSectorId;
            updateData.assigneeId = null;
            updateData.status = 'open';
        } else if (data.toUserId) {
            updateData.assigneeId = data.toUserId;
            updateData.lockedByUserId = data.toUserId;
            updateData.lockedAt = new Date();
        }

        return this.prisma.conversation.update({ where: { id }, data: updateData });
    }

    async lock(companyId: string, id: string, userId: string) {
        const conv = await this.findOne(companyId, id);
        if (conv.lockedByUserId && conv.lockedByUserId !== userId) {
            const lockAge = conv.lockedAt ? (Date.now() - new Date(conv.lockedAt).getTime()) / 1000 : 999;
            if (lockAge < 120) throw new ConflictException('Conversa bloqueada por outro atendente');
        }
        return this.prisma.conversation.update({
            where: { id },
            data: { lockedByUserId: userId, lockedAt: new Date() },
        });
    }

    async unlock(companyId: string, id: string) {
        return this.prisma.conversation.update({
            where: { id },
            data: { lockedByUserId: null, lockedAt: null },
        });
    }

    async getNextDisplayId(companyId: string): Promise<number> {
        const last = await this.prisma.conversation.findFirst({
            where: { companyId },
            orderBy: { displayId: 'desc' },
            select: { displayId: true },
        });
        return (last?.displayId || 0) + 1;
    }

    async getTransfers(companyId: string, conversationId: string) {
        return this.prisma.conversationTransfer.findMany({
            where: { conversationId, companyId },
            include: {
                fromUser: { select: { id: true, name: true } },
                toUser: { select: { id: true, name: true } },
                fromSector: { select: { id: true, name: true } },
                toSector: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
}
