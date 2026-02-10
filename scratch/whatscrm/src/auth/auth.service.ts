import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private config: ConfigService,
    ) { }

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findFirst({
            where: { email: dto.email, active: true },
        });

        if (!user) {
            throw new UnauthorizedException('Credenciais inválidas');
        }

        const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Credenciais inválidas');
        }

        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });

        await this.prisma.auditLog.create({
            data: {
                companyId: user.companyId,
                userId: user.id,
                action: 'login',
                entityType: 'user',
                entityId: user.id,
                changes: {},
            },
        });

        const payload = {
            sub: user.id,
            email: user.email,
            companyId: user.companyId,
            role: user.role,
            name: user.name,
        };

        return {
            accessToken: this.jwtService.sign(payload),
            refreshToken: this.jwtService.sign(payload, {
                secret: this.config.get('JWT_REFRESH_SECRET'),
                expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN') || '7d',
            }),
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                companyId: user.companyId,
            },
        };
    }

    async refreshToken(refreshToken: string) {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.config.get('JWT_REFRESH_SECRET'),
            });

            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
            });

            if (!user || !user.active) {
                throw new UnauthorizedException('Token inválido');
            }

            const newPayload = {
                sub: user.id,
                email: user.email,
                companyId: user.companyId,
                role: user.role,
                name: user.name,
            };

            return {
                accessToken: this.jwtService.sign(newPayload),
            };
        } catch {
            throw new UnauthorizedException('Refresh token inválido ou expirado');
        }
    }

    async getProfile(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                userSectors: {
                    include: { sector: true },
                },
            },
        });

        if (!user) {
            throw new UnauthorizedException('Usuário não encontrado');
        }

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            companyId: user.companyId,
            avatarUrl: user.avatarUrl,
            sectors: user.userSectors.map((us) => ({
                id: us.sector.id,
                name: us.sector.name,
                color: us.sector.color,
            })),
        };
    }
}
