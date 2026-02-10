import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChannelsService } from './channels.service';
import { Roles, CurrentUser } from '../common/decorators';
import { RolesGuard } from '../common/guards';

@Controller('api/v1/channels')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
export class ChannelsController {
    constructor(private channelsService: ChannelsService) { }

    @Get()
    findAll(@CurrentUser('companyId') companyId: string) {
        return this.channelsService.findAll(companyId);
    }

    @Get(':id')
    findOne(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
        return this.channelsService.findOne(companyId, id);
    }

    @Post()
    create(@CurrentUser('companyId') companyId: string, @Body() body: any) {
        return this.channelsService.create(companyId, body);
    }

    @Patch(':id')
    update(@CurrentUser('companyId') companyId: string, @Param('id') id: string, @Body() body: any) {
        return this.channelsService.update(companyId, id, body);
    }

    @Delete(':id')
    deactivate(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
        return this.channelsService.update(companyId, id, { active: false });
    }
}
