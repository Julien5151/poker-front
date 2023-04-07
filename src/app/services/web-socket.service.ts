import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SocketEvent } from '../enums/socket-event.enum';
import { MessageType, UserEffect, VoteValue } from '../shared/enums';
import { PingMessage, RoomMessage, WebSocketMessage } from '../shared/interfaces';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket!: WebSocket;
  public socketEvent$ = new Subject<{ type: SocketEvent; message: WebSocketMessage | null }>();

  public initWebSocket(): void {
    this.socket = new WebSocket(`${environment.prod ? 'wss' : 'ws'}://${environment.wsUrl}/web_socket`);
    this.handleOpen();
    this.handleMessage();
    this.handleClose();
    this.handleError();
  }

  public closeWebSocket(): void {
    this.socket.close();
  }

  private handleOpen(): void {
    this.socket.addEventListener(SocketEvent.Open, () => {
      this.socketEvent$.next({ type: SocketEvent.Open, message: null });
    });
  }

  private handleMessage(): void {
    this.socket.addEventListener(SocketEvent.Message, (event: MessageEvent) => {
      try {
        const message: RoomMessage | PingMessage = JSON.parse(event.data);
        this.socketEvent$.next({ type: SocketEvent.Message, message });
      } catch (error) {
        console.error('Failed to parse websocket message');
      }
    });
  }

  private handleError(): void {
    this.socket.addEventListener(SocketEvent.Error, () => {
      this.initWebSocket();
    });
  }

  private handleClose(): void {
    this.socket.addEventListener(SocketEvent.Close, () => {
      this.initWebSocket();
    });
  }

  public sendVoteMessage(vote: VoteValue): void {
    this.sendWebSocketMessage({ event: MessageType.UserVoteUpdate, data: vote });
  }

  public sendUserEffectMessage(userEffect: UserEffect): void {
    this.sendWebSocketMessage({ event: MessageType.UserEffectUpdate, data: userEffect });
  }

  public sendUserNameUpdateMessage(userName: string): void {
    this.sendWebSocketMessage({ event: MessageType.UserNameUpdate, data: userName });
  }

  public sendToggleHideMessage(): void {
    this.sendWebSocketMessage({ event: MessageType.HiddenUpdate });
  }

  public sendResetVotesMessage(): void {
    this.sendWebSocketMessage({ event: MessageType.ResetVotes });
  }

  private sendWebSocketMessage(wsMessage: WebSocketMessage): void {
    try {
      const stringifiedMessage = JSON.stringify(wsMessage);
      this.socket.send(stringifiedMessage);
    } catch (error) {
      console.error('Failed to stringify websocket message before sending it');
    }
  }
}
