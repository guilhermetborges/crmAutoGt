import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReportsService } from './reports.service';
import { CurrentUser, Roles } from '../common/decorators';
import { RolesGuard } from '../common/guards';

@Controller('api/v1/reports')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin', 'supervisor')
export class ReportsController {
    constructor(private reportsService: ReportsService) { }

    @Get('overview')
    getOverview(
        @CurrentUser('companyId') companyId: string,
        @Query('dateFrom') dateFrom: string,
        @Query('dateTo') dateTo: string,
    ) { return this.reportsService.getOverview(companyId, dateFrom, dateTo); }

    @Get('by-sector')
    getBySector(
        @CurrentUser('companyId') companyId: string,
        @Query('dateFrom') dateFrom: string,
        @Query('dateTo') dateTo: string,
    ) { return this.reportsService.getBySector(companyId, dateFrom, dateTo); }

    @Get('by-agent')
    getByAgent(
        @CurrentUser('companyId') companyId: string,
        @Query('dateFrom') dateFrom: string,
        @Query('dateTo') dateTo: string,
    ) { return this.reportsService.getByAgent(companyId, dateFrom, dateTo); }

    @Get('sla')
    getSla(
        @CurrentUser('companyId') companyId: string,
        @Query('dateFrom') dateFrom: string,
        @Query('dateTo') dateTo: string,
    ) { return this.reportsService.getSlaReport(companyId, dateFrom, dateTo); }
}
