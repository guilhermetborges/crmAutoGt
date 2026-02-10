import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { Roles, CurrentUser } from '../common/decorators';
import { RolesGuard } from '../common/guards';

@Controller('api/v1/users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Get()
    @Roles('admin', 'supervisor')
    findAll(
        @CurrentUser('companyId') companyId: string,
        @Query('role') role?: string,
        @Query('sectorId') sectorId?: string,
    ) {
        return this.usersService.findAll(companyId, { role, sectorId });
    }

    @Get(':id')
    @Roles('admin', 'supervisor')
    findOne(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
        return this.usersService.findOne(companyId, id);
    }

    @Post()
    @Roles('admin')
    create(@CurrentUser('companyId') companyId: string, @Body() dto: CreateUserDto) {
        return this.usersService.create(companyId, dto);
    }

    @Patch(':id')
    @Roles('admin')
    update(@CurrentUser('companyId') companyId: string, @Param('id') id: string, @Body() dto: UpdateUserDto) {
        return this.usersService.update(companyId, id, dto);
    }

    @Delete(':id')
    @Roles('admin')
    deactivate(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
        return this.usersService.deactivate(companyId, id);
    }
}
