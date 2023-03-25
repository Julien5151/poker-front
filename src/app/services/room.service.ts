import { Injectable } from '@angular/core';
import { BehaviorSubject, filter } from 'rxjs';
import { SocketEvent } from '../enums/socket-event.enum';
import { MessageType } from '../shared/enums';
import { RoomState } from '../shared/interfaces';
import { WebSocketService } from './web-socket.service';

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  public previousRoomState: RoomState = { isHidden: true, users: [] };
  public roomStateEvent$ = new BehaviorSubject<RoomState>({ isHidden: true, users: [] });

  constructor(private readonly webSocketService: WebSocketService) {
    this.webSocketService.socketEvent$.pipe(filter((event) => event.type === SocketEvent.Message)).subscribe((event) => {
      const message = event.message;
      if (message?.event === MessageType.RoomUpdate) {
        // Store previous value
        this.previousRoomState = this.roomStateEvent$.value;
        // Emit new room state
        this.roomStateEvent$.next(message.data);
      }
    });
  }
}
