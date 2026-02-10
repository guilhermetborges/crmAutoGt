import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TagsService } from './tags.service';
import { CurrentUser, Roles } from '../common/decorators';
import { RolesGuard } from '../common/guards';

@Controller('api/v1')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class TagsController {
    constructor(private tagsService: TagsService) { }

    @Get('tags')
    findAll(@CurrentUser('companyId') companyId: string) {
        return this.tagsService.findAll(companyId);
    }

    @Post('tags')
    @Roles('admin', 'supervisor')
    create(@CurrentUser('companyId') companyId: string, @Body() body: { name: string; color?: string }) {
        return this.tagsService.create(companyId, body);
    }

    @Patch('tags/:id')
    @Roles('admin', 'supervisor')
    update(@CurrentUser('companyId') companyId: string, @Param('id') id: string, @Body() body: any) {
        return this.tagsService.update(companyId, id, body);
    }

    @Delete('tags/:id')
    @Roles('admin')
    remove(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
        return this.tagsService.delete(companyId, id);
    }

    @Post('conversations/:conversationId/tags')
    addTag(@CurrentUser('companyId') companyId: string, @Param('conversationId') convId: string, @Body('tagId') tagId: string) {
        return this.tagsService.addToConversation(companyId, convId, tagId);
    }

    @Delete('conversations/:conversationId/tags/:tagId')
    removeTag(@Param('conversationId') convId: string, @Param('tagId') tagId: string) {
        return this.tagsService.removeFromConversation(convId, tagId);
    }
}
