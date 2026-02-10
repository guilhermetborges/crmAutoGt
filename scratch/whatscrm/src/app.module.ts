import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SectorsModule } from './sectors/sectors.module';
import { ChannelsModule } from './channels/channels.module';
import { ContactsModule } from './contacts/contacts.module';
import { ConversationsModule } from './conversations/conversations.module';
import { MessagesModule } from './messages/messages.module';
import { TagsModule } from './tags/tags.module';
import { QuickRepliesModule } from './quick-replies/quick-replies.module';
import { TemplatesModule } from './templates/templates.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { ReportsModule } from './reports/reports.module';
import { WebhookModule } from './webhook/webhook.module';
import { EventsModule } from './gateway/events.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    SectorsModule,
    ChannelsModule,
    ContactsModule,
    ConversationsModule,
    MessagesModule,
    TagsModule,
    QuickRepliesModule,
    TemplatesModule,
    AuditLogsModule,
    ReportsModule,
    WebhookModule,
    EventsModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule { }
