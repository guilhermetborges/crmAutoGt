import { Controller, Get, Post, Body, Param, Query, Res, HttpCode, Logger, BadRequestException } from '@nestjs/common';
import type { Response } from 'express';
import { WebhookService } from './webhook.service';

@Controller('webhooks/whatsapp')
export class WebhookController {
    private readonly logger = new Logger(WebhookController.name);

    constructor(private webhookService: WebhookService) { }

    @Get(':channelId')
    async verify(
        @Param('channelId') channelId: string,
        @Query('hub.mode') mode: string,
        @Query('hub.verify_token') token: string,
        @Query('hub.challenge') challenge: string,
        @Res() res: Response,
    ) {
        try {
            const result = await this.webhookService.verifyWebhook(channelId, mode, token, challenge);
            res.status(200).send(result);
        } catch (error) {
            this.logger.warn(`Webhook verification failed: ${(error as Error).message}`);
            res.status(403).send('Forbidden');
        }
    }

    @Post(':channelId')
    @HttpCode(200)
    async receive(
        @Param('channelId') channelId: string,
        @Body() body: any,
    ) {
        // Process async — respond 200 immediately (Meta requires <15s)
        setImmediate(() => this.webhookService.processWebhook(channelId, body));
        return { status: 'received' };
    }
}
