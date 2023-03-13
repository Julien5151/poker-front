import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MessageType, Vote } from './shared/enums';
import { RoomMessage, RoomState, WebSocketMessage } from './shared/interfaces';

export interface VoteElement {
  name: string;
  vote: Vote | null;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  public roomState: RoomState = { isHidden: true, users: [] };
  public readonly VOTE_CARD = [
    Vote.One,
    Vote.Two,
    Vote.Three,
    Vote.Five,
    Vote.Eight,
    Vote.Thirteen,
    Vote.TwentyOne,
    Vote.Graive,
    Vote.MiddleFinger,
    Vote.Quezac,
    Vote.Quit,
    Vote.Surf,
  ];

  private socket = new WebSocket(`${environment.prod ? 'wss' : 'ws'}://${environment.wsUrl}/web_socket`);

  public displayedColumns: string[] = ['name', 'vote'];
  public dataSource: Array<VoteElement> = [];

  public nameControl = new FormControl<string>(this.getUserNameFromLocalStorage() ?? '');
  private subs: Array<Subscription> = [];

  public ngOnInit(): void {
    this.handleSocketOpen();
    this.handleRoomUpdateMessages();
    this.subs.push(this.handleNameControlValueChanges());
  }

  public ngOnDestroy(): void {
    this.subs.forEach((sub) => sub.unsubscribe());
    this.socket.close();
  }

  public sendVote(vote: Vote): void {
    this.sendWebSocketMessage({ event: MessageType.UserVoteUpdate, data: vote });
  }

  public toggleHide(): void {
    this.sendWebSocketMessage({ event: MessageType.HiddenUpdate });
  }

  public resetVotes(): void {
    this.sendWebSocketMessage({ event: MessageType.ResetVotes });
  }

  private sendUserName(userName: string): void {
    this.sendWebSocketMessage({ event: MessageType.UserNameUpdate, data: userName });
  }

  private handleSocketOpen(): void {
    this.socket.addEventListener('open', () => {
      const userName = this.nameControl.value;
      if (userName) this.sendUserName(userName);
    });
  }

  private handleRoomUpdateMessages(): void {
    this.socket.addEventListener('message', (event) => {
      const message: RoomMessage = JSON.parse(event.data);
      this.roomState = message.data;
      const newDataSource: Array<VoteElement> = [];
      this.roomState.users.forEach((user, index) => {
        newDataSource.push({ name: user.name, vote: user.vote });
        if (!this.nameControl.value && index === this.roomState.users.length - 1) {
          this.nameControl.setValue(user.name);
        }
      });
      this.dataSource = newDataSource;
    });
  }

  private handleNameControlValueChanges(): Subscription {
    return this.nameControl.valueChanges.pipe(debounceTime(700)).subscribe((name) => {
      if (name) {
        this.setUserNameToLocalStorage(name);
        this.sendUserName(name);
      }
    });
  }

  private sendWebSocketMessage(wsMessage: WebSocketMessage): void {
    this.socket.send(JSON.stringify(wsMessage));
  }

  private setUserNameToLocalStorage(userName: string): void {
    globalThis.localStorage.setItem('userName', userName);
  }

  private getUserNameFromLocalStorage(): string | null {
    return globalThis.localStorage.getItem('userName');
  }
}
