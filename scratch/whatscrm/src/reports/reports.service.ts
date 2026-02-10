import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
    constructor(private prisma: PrismaService) { }

    async getOverview(companyId: string, dateFrom: string, dateTo: string) {
        const from = new Date(dateFrom);
        const to = new Date(dateTo);

        const [totalConversations, resolvedConversations, conversations] = await Promise.all([
            this.prisma.conversation.count({ where: { companyId, createdAt: { gte: from, lte: to } } }),
            this.prisma.conversation.count({ where: { companyId, status: 'resolved', resolvedAt: { gte: from, lte: to } } }),
            this.prisma.conversation.findMany({
                where: { companyId, createdAt: { gte: from, lte: to }, firstReplyAt: { not: null } },
                select: { createdAt: true, firstReplyAt: true, resolvedAt: true },
            }),
        ]);

        const avgFirstReplySeconds = conversations.length > 0
            ? conversations.reduce((sum, c) => sum + (c.firstReplyAt!.getTime() - c.createdAt.getTime()) / 1000, 0) / conversations.length
            : 0;

        const resolvedConvs = conversations.filter((c) => c.resolvedAt);
        const avgResolutionSeconds = resolvedConvs.length > 0
            ? resolvedConvs.reduce((sum, c) => sum + (c.resolvedAt!.getTime() - c.createdAt.getTime()) / 1000, 0) / resolvedConvs.length
            : 0;

        const openConversations = await this.prisma.conversation.count({ where: { companyId, status: { in: ['open', 'in_progress'] } } });

        return {
            period: { from: dateFrom, to: dateTo },
            totalConversations,
            resolvedConversations,
            openConversations,
            avgFirstReplySeconds: Math.round(avgFirstReplySeconds),
            avgResolutionSeconds: Math.round(avgResolutionSeconds),
        };
    }

    async getBySector(companyId: string, dateFrom: string, dateTo: string) {
        const from = new Date(dateFrom);
        const to = new Date(dateTo);
        const sectors = await this.prisma.sector.findMany({
            where: { companyId },
            include: {
                _count: { select: { conversations: true } },
                conversations: {
                    where: { createdAt: { gte: from, lte: to } },
                    select: { status: true, firstReplyAt: true, createdAt: true },
                },
            },
        });

        return sectors.map((s) => ({
            sector: { id: s.id, name: s.name, color: s.color },
            totalConversations: s.conversations.length,
            openConversations: s.conversations.filter((c) => ['open', 'in_progress'].includes(c.status)).length,
            resolvedConversations: s.conversations.filter((c) => c.status === 'resolved').length,
        }));
    }

    async getByAgent(companyId: string, dateFrom: string, dateTo: string) {
        const from = new Date(dateFrom);
        const to = new Date(dateTo);
        const users = await this.prisma.user.findMany({
            where: { companyId, role: { in: ['atendente', 'supervisor'] } },
            select: {
                id: true, name: true,
                assignedConversations: {
                    where: { createdAt: { gte: from, lte: to } },
                    select: { status: true, firstReplyAt: true, createdAt: true, resolvedAt: true },
                },
            },
        });

        return users.map((u) => ({
            agent: { id: u.id, name: u.name },
            totalConversations: u.assignedConversations.length,
            resolved: u.assignedConversations.filter((c) => c.status === 'resolved').length,
            avgFirstReplySeconds: this.calcAvgReply(u.assignedConversations),
        }));
    }

    async getSlaReport(companyId: string, dateFrom: string, dateTo: string) {
        const from = new Date(dateFrom);
        const to = new Date(dateTo);
        const events = await this.prisma.sLAEvent.findMany({
            where: { companyId, createdAt: { gte: from, lte: to } },
            include: { conversation: { select: { displayId: true, contact: { select: { name: true } } } } },
            orderBy: { createdAt: 'desc' },
        });
        const breaches = events.filter((e) => e.eventType.includes('breach'));
        return { totalEvents: events.length, totalBreaches: breaches.length, events };
    }

    private calcAvgReply(convs: any[]): number {
        const withReply = convs.filter((c) => c.firstReplyAt);
        if (!withReply.length) return 0;
        return Math.round(withReply.reduce((s, c) => s + (c.firstReplyAt.getTime() - c.createdAt.getTime()) / 1000, 0) / withReply.length);
    }
}
