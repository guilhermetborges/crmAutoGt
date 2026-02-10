import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TemplatesService {
    constructor(private prisma: PrismaService) { }

    async findAll(companyId: string) {
        return this.prisma.whatsAppTemplate.findMany({
            where: { companyId },
            orderBy: { name: 'asc' },
        });
    }

    async findOne(companyId: string, id: string) {
        const tpl = await this.prisma.whatsAppTemplate.findFirst({ where: { id, companyId } });
        if (!tpl) throw new NotFoundException('Template não encontrado');
        return tpl;
    }

    async syncFromMeta(companyId: string, channelId: string, templates: any[]) {
        for (const tpl of templates) {
            await this.prisma.whatsAppTemplate.upsert({
                where: { id: tpl.id || '' },
                create: {
                    companyId, channelId, waTemplateId: tpl.id, name: tpl.name,
                    language: tpl.language, category: tpl.category, status: tpl.status,
                    components: tpl.components || [], syncedAt: new Date(),
                },
                update: {
                    name: tpl.name, status: tpl.status, components: tpl.components || [],
                    category: tpl.category, syncedAt: new Date(),
                },
            });
        }
        return { synced: templates.length };
    }
}
