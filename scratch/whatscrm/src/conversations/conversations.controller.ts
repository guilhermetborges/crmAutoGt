import { Controller, Get, Patch, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConversationsService } from './conversations.service';
import { SectorsService } from '../sectors/sectors.service';
import { CurrentUser } from '../common/decorators';
import { RolesGuard } from '../common/guards';

@Controller('api/v1/conversations')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ConversationsController {
    constructor(
        private conversationsService: ConversationsService,
        private sectorsService: SectorsService,
    ) { }

    @Get()
    async findAll(
        @CurrentUser() user: any,
        @Query('status') status?: string,
        @Query('sectorId') sectorId?: string,
        @Query('assigneeId') assigneeId?: string,
        @Query('tagId') tagId?: string,
        @Query('contactQuery') contactQuery?: string,
        @Query('cursor') cursor?: string,
        @Query('limit') limit?: string,
    ) {
        const sectorIds = await this.sectorsService.getUserSectorIds(user.sub);
        return this.conversationsService.findAll(user.companyId, user.role, sectorIds, {
            status, sectorId, assigneeId, tagId, contactQuery, cursor,
            limit: limit ? parseInt(limit, 10) : 25,
        });
    }

    @Get(':id')
    findOne(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
        return this.conversationsService.findOne(companyId, id);
    }

    @Patch(':id/status')
    updateStatus(
        @CurrentUser() user: any,
        @Param('id') id: string,
        @Body('status') status: string,
    ) {
        return this.conversationsService.updateStatus(user.companyId, id, status, user.sub);
    }

    @Post(':id/assign')
    assign(
        @CurrentUser('companyId') companyId: string,
        @Param('id') id: string,
        @Body('assigneeId') assigneeId: string,
    ) {
        return this.conversationsService.assign(companyId, id, assigneeId);
    }

    @Post(':id/transfer')
    transfer(
        @CurrentUser() user: any,
        @Param('id') id: string,
        @Body() body: { toUserId?: string; toSectorId?: string; reason: string },
    ) {
        return this.conversationsService.transfer(user.companyId, id, body, user.sub);
    }

    @Post(':id/lock')
    lock(@CurrentUser() user: any, @Param('id') id: string) {
        return this.conversationsService.lock(user.companyId, id, user.sub);
    }

    @Delete(':id/lock')
    unlock(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
        return this.conversationsService.unlock(companyId, id);
    }

    @Get(':id/transfers')
    getTransfers(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
        return this.conversationsService.getTransfers(companyId, id);
    }
}
