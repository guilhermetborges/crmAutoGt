import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SectorsService {
    constructor(private prisma: PrismaService) { }

    async findAll(companyId: string) {
        return this.prisma.sector.findMany({
            where: { companyId },
            include: { _count: { select: { userSectors: true, conversations: true } } },
            orderBy: { name: 'asc' },
        });
    }

    async findOne(companyId: string, id: string) {
        const sector = await this.prisma.sector.findFirst({ where: { id, companyId } });
        if (!sector) throw new NotFoundException('Setor não encontrado');
        return sector;
    }

    async create(companyId: string, data: { name: string; description?: string; color?: string }) {
        const exists = await this.prisma.sector.findFirst({
            where: { companyId, name: data.name },
        });
        if (exists) throw new ConflictException('Setor com este nome já existe');
        return this.prisma.sector.create({ data: { companyId, ...data } });
    }

    async update(companyId: string, id: string, data: { name?: string; description?: string; color?: string; active?: boolean }) {
        await this.findOne(companyId, id);
        return this.prisma.sector.update({ where: { id }, data });
    }

    async addUser(companyId: string, sectorId: string, userId: string) {
        await this.findOne(companyId, sectorId);
        return this.prisma.userSector.create({ data: { userId, sectorId } });
    }

    async removeUser(companyId: string, sectorId: string, userId: string) {
        const link = await this.prisma.userSector.findFirst({ where: { userId, sectorId } });
        if (!link) throw new NotFoundException('Usuário não está neste setor');
        return this.prisma.userSector.delete({ where: { id: link.id } });
    }

    async getUsers(companyId: string, sectorId: string) {
        await this.findOne(companyId, sectorId);
        const links = await this.prisma.userSector.findMany({
            where: { sectorId },
            include: { user: { select: { id: true, name: true, email: true, role: true, active: true, avatarUrl: true } } },
        });
        return links.map((l) => l.user);
    }

    async getUserSectorIds(userId: string): Promise<string[]> {
        const sectors = await this.prisma.userSector.findMany({
            where: { userId },
            select: { sectorId: true },
        });
        return sectors.map((s) => s.sectorId);
    }
}
