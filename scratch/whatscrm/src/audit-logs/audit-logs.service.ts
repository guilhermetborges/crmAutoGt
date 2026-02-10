import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditLogsService {
    constructor(private prisma: PrismaService) { }

    async findAll(companyId: string, filters: {
        userId?: string; action?: string; entityType?: string;
        dateFrom?: string; dateTo?: string; cursor?: string; limit?: number;
    }) {
        const limit = Math.min(filters.limit || 50, 100);
        const where: any = { companyId };
        if (filters.userId) where.userId = filters.userId;
        if (filters.action) where.action = filters.action;
        if (filters.entityType) where.entityType = filters.entityType;
        if (filters.dateFrom || filters.dateTo) {
            where.createdAt = {};
            if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
            if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
        }
        if (filters.cursor) where.id = { lt: filters.cursor };

        const logs = await this.prisma.auditLog.findMany({
            where,
            take: limit + 1,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { id: true, name: true, email: true } } },
        });

        const hasMore = logs.length > limit;
        return { data: hasMore ? logs.slice(0, limit) : logs, hasMore };
    }

    async findIntegrationLogs(companyId: string, filters: {
        channelId?: string; dateFrom?: string; dateTo?: string; cursor?: string; limit?: number;
    }) {
        const limit = Math.min(filters.limit || 50, 100);
        const where: any = { companyId };
        if (filters.channelId) where.channelId = filters.channelId;
        if (filters.dateFrom || filters.dateTo) {
            where.createdAt = {};
            if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
            if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
        }
        if (filters.cursor) where.id = { lt: filters.cursor };

        const logs = await this.prisma.integrationLog.findMany({
            where, take: limit + 1, orderBy: { createdAt: 'desc' },
        });

        const hasMore = logs.length > limit;
        return { data: hasMore ? logs.slice(0, limit) : logs, hasMore };
    }
}
