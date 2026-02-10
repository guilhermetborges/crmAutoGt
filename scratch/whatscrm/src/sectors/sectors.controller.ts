import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SectorsService } from './sectors.service';
import { Roles, CurrentUser } from '../common/decorators';
import { RolesGuard } from '../common/guards';

@Controller('api/v1/sectors')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class SectorsController {
    constructor(private sectorsService: SectorsService) { }

    @Get()
    findAll(@CurrentUser('companyId') companyId: string) {
        return this.sectorsService.findAll(companyId);
    }

    @Post()
    @Roles('admin')
    create(@CurrentUser('companyId') companyId: string, @Body() body: { name: string; description?: string; color?: string }) {
        return this.sectorsService.create(companyId, body);
    }

    @Patch(':id')
    @Roles('admin')
    update(@CurrentUser('companyId') companyId: string, @Param('id') id: string, @Body() body: any) {
        return this.sectorsService.update(companyId, id, body);
    }

    @Delete(':id')
    @Roles('admin')
    deactivate(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
        return this.sectorsService.update(companyId, id, { active: false });
    }

    @Post(':id/users')
    @Roles('admin', 'supervisor')
    addUser(@CurrentUser('companyId') companyId: string, @Param('id') id: string, @Body('userId') userId: string) {
        return this.sectorsService.addUser(companyId, id, userId);
    }

    @Delete(':id/users/:userId')
    @Roles('admin', 'supervisor')
    removeUser(@CurrentUser('companyId') companyId: string, @Param('id') id: string, @Param('userId') userId: string) {
        return this.sectorsService.removeUser(companyId, id, userId);
    }

    @Get(':id/users')
    @Roles('admin', 'supervisor')
    getUsers(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
        return this.sectorsService.getUsers(companyId, id);
    }
}
