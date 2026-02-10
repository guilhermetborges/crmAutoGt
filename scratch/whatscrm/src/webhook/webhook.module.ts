import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { ContactsModule } from '../contacts/contacts.module';
import { ConversationsModule } from '../conversations/conversations.module';
import { MessagesModule } from '../messages/messages.module';
import { ChannelsModule } from '../channels/channels.module';
import { EventsModule } from '../gateway/events.module';

@Module({
    imports: [ContactsModule, ConversationsModule, MessagesModule, ChannelsModule, EventsModule],
    controllers: [WebhookController],
    providers: [WebhookService],
})
export class WebhookModule { }
