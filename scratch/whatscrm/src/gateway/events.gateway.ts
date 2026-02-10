import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@WebSocketGateway({
    cors: { origin: '*' },
    namespace: '/ws',
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    private readonly logger = new Logger(EventsGateway.name);

    constructor(
        private jwtService: JwtService,
        private prisma: PrismaService,
    ) { }

    async handleConnection(client: Socket) {
        try {
            const token = client.handshake.query.token as string || client.handshake.auth?.token;
            if (!token) {
                client.disconnect();
                return;
            }

            const payload = this.jwtService.verify(token);
            client.data.user = payload;

            // Join company room
            client.join(`company:${payload.companyId}`);

            // Join sector rooms
            const userSectors = await this.prisma.userSector.findMany({
                where: { userId: payload.sub },
                select: { sectorId: true },
            });
            for (const us of userSectors) {
                client.join(`sector:${us.sectorId}`);
            }

            this.logger.log(`Client connected: ${payload.email} (${payload.role})`);
        } catch (error) {
            this.logger.warn(`WebSocket auth failed: ${error.message}`);
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        const email = client.data?.user?.email || 'unknown';
        this.logger.log(`Client disconnected: ${email}`);
    }

    emitToCompany(companyId: string, event: string, data: any) {
        this.server?.to(`company:${companyId}`).emit(event, data);
    }

    emitToSector(sectorId: string, event: string, data: any) {
        this.server?.to(`sector:${sectorId}`).emit(event, data);
    }

    emitToUser(userId: string, event: string, data: any) {
        this.server?.to(`user:${userId}`).emit(event, data);
    }
}
