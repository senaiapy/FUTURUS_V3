import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'groups',
})
export class GroupsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('GroupsGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Client connected to groups: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected from groups: ${client.id}`);
  }

  @SubscribeMessage('joinGroupRoom')
  handleJoinGroup(
    @ConnectedSocket() client: Socket,
    @MessageBody() groupId: number | string,
  ) {
    const room = `group:${groupId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} joined room ${room}`);
    return { event: 'joined', groupId };
  }

  @SubscribeMessage('leaveGroupRoom')
  handleLeaveGroup(
    @ConnectedSocket() client: Socket,
    @MessageBody() groupId: number | string,
  ) {
    const room = `group:${groupId}`;
    client.leave(room);
    this.logger.log(`Client ${client.id} left room ${room}`);
    return { event: 'left', groupId };
  }

  // ============================================
  // EMIT METHODS (called from service)
  // ============================================

  emitGroupUpdate(groupId: number, data: any) {
    this.server.to(`group:${groupId}`).emit('groupUpdate', data);
  }

  emitMemberJoined(groupId: number, member: any) {
    this.server.to(`group:${groupId}`).emit('memberJoined', member);
  }

  emitMemberLeft(groupId: number, userId: number) {
    this.server.to(`group:${groupId}`).emit('memberLeft', { userId });
  }

  emitLiquidityUpdate(
    groupId: number,
    currentLiquidity: number,
    targetLiquidity: number,
  ) {
    this.server.to(`group:${groupId}`).emit('liquidityUpdate', {
      currentLiquidity,
      targetLiquidity,
      percentage: (currentLiquidity / targetLiquidity) * 100,
    });
  }

  emitGroupLocked(groupId: number) {
    this.server.to(`group:${groupId}`).emit('groupLocked', { groupId });
  }

  emitGroupExecuted(groupId: number, order: any) {
    this.server
      .to(`group:${groupId}`)
      .emit('groupExecuted', { groupId, order });
  }

  emitGroupResolved(groupId: number, payouts: any[]) {
    this.server
      .to(`group:${groupId}`)
      .emit('groupResolved', { groupId, payouts });
  }

  emitVoteUpdate(groupId: number, voteResults: { yes: number; no: number }) {
    this.server.to(`group:${groupId}`).emit('voteUpdate', voteResults);
  }
}
