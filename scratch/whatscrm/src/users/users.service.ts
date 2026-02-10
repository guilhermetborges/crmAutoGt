import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findAll(companyId: string, filters?: { role?: string; active?: boolean; sectorId?: string }) {
        const where: any = { companyId };
        if (filters?.role) where.role = filters.role;
        if (filters?.active !== undefined) where.active = filters.active;
        if (filters?.sectorId) {
            where.userSectors = { some: { sectorId: filters.sectorId } };
        }
        return this.prisma.user.findMany({
            where,
            select: {
                id: true, name: true, email: true, role: true, active: true,
                avatarUrl: true, lastLoginAt: true, createdAt: true,
                userSectors: { include: { sector: { select: { id: true, name: true, color: true } } } },
            },
            orderBy: { name: 'asc' },
        });
    }

    async findOne(companyId: string, id: string) {
        const user = await this.prisma.user.findFirst({
            where: { id, companyId },
            select: {
                id: true, name: true, email: true, role: true, active: true,
                avatarUrl: true, lastLoginAt: true, createdAt: true,
                userSectors: { include: { sector: { select: { id: true, name: true, color: true } } } },
            },
        });
        if (!user) throw new NotFoundException('Usuário não encontrado');
        return user;
    }

    async create(companyId: string, dto: CreateUserDto) {
        const exists = await this.prisma.user.findFirst({
            where: { companyId, email: dto.email },
        });
        if (exists) throw new ConflictException('Email já cadastrado nesta empresa');

        const passwordHash = await bcrypt.hash(dto.password, 12);
        return this.prisma.user.create({
            data: {
                companyId,
                name: dto.name,
                email: dto.email,
                passwordHash,
                role: dto.role,
                avatarUrl: dto.avatarUrl,
            },
            select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
        });
    }

    async update(companyId: string, id: string, dto: UpdateUserDto) {
        await this.findOne(companyId, id);
        const data: any = { ...dto };
        if (dto.password) {
            data.passwordHash = await bcrypt.hash(dto.password, 12);
            delete data.password;
        }
        return this.prisma.user.update({
            where: { id },
            data,
            select: { id: true, name: true, email: true, role: true, active: true },
        });
    }

    async deactivate(companyId: string, id: string) {
        await this.findOne(companyId, id);
        return this.prisma.user.update({ where: { id }, data: { active: false } });
    }
}
