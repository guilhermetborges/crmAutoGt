import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create demo company
    const company = await prisma.company.create({
        data: {
            name: 'Empresa Demo',
            domain: 'demo.whatscrm.io',
            timezone: 'America/Sao_Paulo',
            settings: { sla: { firstResponseWarning: 300, firstResponseBreach: 900 } },
        },
    });
    console.log(`✅ Company created: ${company.name} (${company.id})`);

    // Create admin user
    const adminHash = await bcrypt.hash('admin123456', 12);
    const admin = await prisma.user.create({
        data: {
            companyId: company.id,
            name: 'Admin',
            email: 'admin@demo.com',
            passwordHash: adminHash,
            role: 'admin',
        },
    });
    console.log(`✅ Admin created: admin@demo.com / admin123456`);

    // Create supervisor
    const supervisorHash = await bcrypt.hash('super123456', 12);
    const supervisor = await prisma.user.create({
        data: {
            companyId: company.id,
            name: 'Supervisor',
            email: 'supervisor@demo.com',
            passwordHash: supervisorHash,
            role: 'supervisor',
        },
    });
    console.log(`✅ Supervisor created: supervisor@demo.com / super123456`);

    // Create atendente
    const atendenteHash = await bcrypt.hash('agent123456', 12);
    const atendente = await prisma.user.create({
        data: {
            companyId: company.id,
            name: 'Atendente João',
            email: 'joao@demo.com',
            passwordHash: atendenteHash,
            role: 'atendente',
        },
    });
    console.log(`✅ Atendente created: joao@demo.com / agent123456`);

    // Create sectors
    const sectorComercial = await prisma.sector.create({
        data: { companyId: company.id, name: 'Comercial', description: 'Setor de vendas', color: '#22c55e' },
    });
    const sectorSuporte = await prisma.sector.create({
        data: { companyId: company.id, name: 'Suporte', description: 'Suporte técnico', color: '#3b82f6' },
    });
    console.log(`✅ Sectors created: Comercial, Suporte`);

    // Assign users to sectors
    await prisma.userSector.createMany({
        data: [
            { userId: supervisor.id, sectorId: sectorComercial.id },
            { userId: supervisor.id, sectorId: sectorSuporte.id },
            { userId: atendente.id, sectorId: sectorComercial.id },
        ],
    });
    console.log(`✅ Users assigned to sectors`);

    // Create tags
    await prisma.tag.createMany({
        data: [
            { companyId: company.id, name: 'Urgente', color: '#ef4444' },
            { companyId: company.id, name: 'VIP', color: '#f59e0b' },
            { companyId: company.id, name: 'Reclamação', color: '#8b5cf6' },
            { companyId: company.id, name: 'Novo Cliente', color: '#10b981' },
        ],
    });
    console.log(`✅ Tags created`);

    // Create quick replies
    await prisma.quickReply.createMany({
        data: [
            { companyId: company.id, shortcode: 'ola', content: 'Olá! Como posso ajudá-lo(a) hoje? 😊', createdById: admin.id },
            { companyId: company.id, shortcode: 'aguarde', content: 'Aguarde um momento, por favor. Estou verificando para você.', createdById: admin.id },
            { companyId: company.id, shortcode: 'obrigado', content: 'Obrigado pelo contato! Se precisar de mais alguma coisa, é só chamar. 👋', createdById: admin.id },
            { companyId: company.id, shortcode: 'horario', content: 'Nosso horário de atendimento é de segunda a sexta, das 8h às 18h.', createdById: admin.id },
        ],
    });
    console.log(`✅ Quick replies created`);

    // Create a demo WhatsApp channel (fake data)
    const key = Buffer.from(process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', 'hex');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    let encrypted = cipher.update('DEMO_ACCESS_TOKEN', 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    const encryptedToken = `${iv.toString('hex')}:${authTag}:${encrypted}`;

    await prisma.whatsAppChannel.create({
        data: {
            companyId: company.id,
            phoneNumber: '+5511999999999',
            phoneNumberId: '123456789',
            wabaId: 'waba_demo_001',
            businessName: 'Empresa Demo WhatsApp',
            encryptedAccessToken: encryptedToken,
            verifyToken: crypto.randomBytes(32).toString('hex'),
        },
    });
    console.log(`✅ Demo WhatsApp channel created`);

    console.log('\n🎉 Seed completed successfully!');
    console.log('\n📝 Login credentials:');
    console.log('   Admin:      admin@demo.com / admin123456');
    console.log('   Supervisor: supervisor@demo.com / super123456');
    console.log('   Atendente:  joao@demo.com / agent123456');
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
