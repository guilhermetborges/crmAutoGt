import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuditLogsService } from './audit-logs.service';
import { CurrentUser, Roles } from '../common/decorators';
import { RolesGuard } from '../common/guards';

@Controller('api/v1')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
export class AuditLogsController {
    constructor(private auditLogsService: AuditLogsService) { }

    @Get('audit-logs')
    findAuditLogs(
        @CurrentUser('companyId') companyId: string,
        @Query('userId') userId?: string, @Query('action') action?: string,
        @Query('entityType') entityType?: string, @Query('dateFrom') dateFrom?: string,
        @Query('dateTo') dateTo?: string, @Query('cursor') cursor?: string,
    ) {
        return this.auditLogsService.findAll(companyId, { userId, action, entityType, dateFrom, dateTo, cursor });
    }

    @Get('integration-logs')
    findIntegrationLogs(
        @CurrentUser('companyId') companyId: string,
        @Query('channelId') channelId?: string, @Query('dateFrom') dateFrom?: string,
        @Query('dateTo') dateTo?: string, @Query('cursor') cursor?: string,
    ) {
        return this.auditLogsService.findIntegrationLogs(companyId, { channelId, dateFrom, dateTo, cursor });
    }
}
