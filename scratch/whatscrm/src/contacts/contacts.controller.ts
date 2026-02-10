import { Controller, Get, Patch, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ContactsService } from './contacts.service';
import { CurrentUser, Roles } from '../common/decorators';
import { RolesGuard } from '../common/guards';

@Controller('api/v1/contacts')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ContactsController {
    constructor(private contactsService: ContactsService) { }

    @Get()
    findAll(@CurrentUser('companyId') companyId: string, @Query('q') q?: string, @Query('cursor') cursor?: string) {
        return this.contactsService.findAll(companyId, q, cursor);
    }

    @Get(':id')
    findOne(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
        return this.contactsService.findOne(companyId, id);
    }

    @Patch(':id')
    update(@CurrentUser('companyId') companyId: string, @Param('id') id: string, @Body() body: any) {
        return this.contactsService.update(companyId, id, body);
    }

    @Post(':id/anonymize')
    @Roles('admin')
    anonymize(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
        return this.contactsService.anonymize(companyId, id);
    }
}
