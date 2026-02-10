import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { QuickRepliesService } from './quick-replies.service';
import { CurrentUser, Roles } from '../common/decorators';
import { RolesGuard } from '../common/guards';

@Controller('api/v1/quick-replies')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class QuickRepliesController {
    constructor(private qrService: QuickRepliesService) { }

    @Get()
    findAll(@CurrentUser('companyId') companyId: string, @Query('q') q?: string) {
        return this.qrService.findAll(companyId, q);
    }

    @Post()
    @Roles('admin', 'supervisor')
    create(@CurrentUser() user: any, @Body() body: { shortcode: string; content: string }) {
        return this.qrService.create(user.companyId, user.sub, body);
    }

    @Patch(':id')
    @Roles('admin', 'supervisor')
    update(@CurrentUser('companyId') companyId: string, @Param('id') id: string, @Body() body: any) {
        return this.qrService.update(companyId, id, body);
    }

    @Delete(':id')
    @Roles('admin', 'supervisor')
    remove(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
        return this.qrService.delete(companyId, id);
    }
}
