import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Injectable()
export class MarketsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinMarket')
  handleJoinMarket(client: Socket, slug: string) {
    client.join(`market_${slug}`);
    console.log(`Client ${client.id} joined market: ${slug}`);
  }

  @SubscribeMessage('leaveMarket')
  handleLeaveMarket(client: Socket, slug: string) {
    client.leave(`market_${slug}`);
    console.log(`Client ${client.id} left market: ${slug}`);
  }

  emitMarketUpdate(market: any) {
    this.server.to(`market_${market.slug}`).emit('marketUpdate', market);
  }

  emitMarketDeleted(slug: string) {
    this.server.emit('marketDeleted', slug);
  }
}
