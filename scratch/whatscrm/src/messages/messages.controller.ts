import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MessagesService } from './messages.service';
import { CurrentUser } from '../common/decorators';
import { RolesGuard } from '../common/guards';

@Controller('api/v1/conversations/:conversationId/messages')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class MessagesController {
    constructor(private messagesService: MessagesService) { }

    @Get()
    findAll(
        @Param('conversationId') conversationId: string,
        @Query('cursor') cursor?: string,
        @Query('limit') limit?: string,
    ) {
        return this.messagesService.findByConversation(conversationId, cursor, limit ? parseInt(limit) : 30);
    }

    @Post()
    send(
        @CurrentUser() user: any,
        @Param('conversationId') conversationId: string,
        @Body() body: { content: string; contentType?: string },
    ) {
        return this.messagesService.sendMessage(user.companyId, conversationId, user.sub, body);
    }

    @Post('internal')
    sendInternal(
        @CurrentUser() user: any,
        @Param('conversationId') conversationId: string,
        @Body() body: { content: string },
    ) {
        return this.messagesService.sendMessage(user.companyId, conversationId, user.sub, {
            content: body.content,
            isInternal: true,
        });
    }

    @Post('template')
    sendTemplate(
        @CurrentUser() user: any,
        @Param('conversationId') conversationId: string,
        @Body() body: { templateId: string; language?: string; components?: any },
    ) {
        return this.messagesService.sendTemplate(user.companyId, conversationId, user.sub, body);
    }
}
