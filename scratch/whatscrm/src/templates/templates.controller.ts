import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TemplatesService } from './templates.service';
import { CurrentUser } from '../common/decorators';
import { RolesGuard } from '../common/guards';

@Controller('api/v1/templates')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class TemplatesController {
    constructor(private templatesService: TemplatesService) { }

    @Get()
    findAll(@CurrentUser('companyId') companyId: string) {
        return this.templatesService.findAll(companyId);
    }

    @Get(':id')
    findOne(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
        return this.templatesService.findOne(companyId, id);
    }
}
