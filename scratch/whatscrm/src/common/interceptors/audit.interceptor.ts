import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
    constructor(private prisma: PrismaService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const method = request.method;

        if (method === 'GET' || !user) {
            return next.handle();
        }

        return next.handle().pipe(
            tap(async (responseData) => {
                try {
                    const action = this.getAction(method, request.route?.path);
                    if (action) {
                        await this.prisma.auditLog.create({
                            data: {
                                companyId: user.companyId,
                                userId: user.sub,
                                action,
                                entityType: this.getEntityType(request.route?.path),
                                entityId: request.params?.id || responseData?.id || null,
                                changes: {
                                    body: this.sanitizeBody(request.body),
                                    params: request.params,
                                },
                                ipAddress: request.ip,
                                userAgent: request.headers['user-agent'],
                            },
                        });
                    }
                } catch (error) {
                    console.error('Audit log error:', error);
                }
            }),
        );
    }

    private getAction(method: string, path?: string): string | null {
        const map: Record<string, string> = {
            POST: 'create',
            PATCH: 'update',
            PUT: 'update',
            DELETE: 'delete',
        };
        return map[method] || null;
    }

    private getEntityType(path?: string): string {
        if (!path) return 'unknown';
        const segments = path.split('/').filter(Boolean);
        return segments.find((s) => !s.startsWith(':') && s !== 'api' && s !== 'v1') || 'unknown';
    }

    private sanitizeBody(body: any): any {
        if (!body) return {};
        const sanitized = { ...body };
        const sensitiveFields = ['password', 'passwordHash', 'accessToken', 'encryptedAccessToken'];
        sensitiveFields.forEach((field) => {
            if (sanitized[field]) sanitized[field] = '[REDACTED]';
        });
        return sanitized;
    }
}
