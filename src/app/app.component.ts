import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import * as confetti from 'canvas-confetti';
import { debounceTime, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { RoomEffect } from './enums/room-effect.enum';
import { MessageType, UserEffect, VoteValue } from './shared/enums';
import { PingMessage, RoomMessage, RoomState, Vote, WebSocketMessage } from './shared/interfaces';

export interface VoteElement {
  name: string;
  vote: Vote | null;
  effect: UserEffect | null;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  private previousRoomState: RoomState = { isHidden: true, users: [] };
  public roomState: RoomState = { isHidden: true, users: [] };
  public readonly VOTE_CARDS: Array<Vote> = [
    {
      value: VoteValue.One,
      weight: 1,
    },
    {
      value: VoteValue.Two,
      weight: 2,
    },
    {
      value: VoteValue.Three,
      weight: 3,
    },
    {
      value: VoteValue.Five,
      weight: 5,
    },
    {
      value: VoteValue.Eight,
      weight: 8,
    },
    {
      value: VoteValue.Thirteen,
      weight: 13,
    },
    {
      value: VoteValue.TwentyOne,
      weight: 21,
    },
    {
      value: VoteValue.Shrug,
      weight: 22,
    },
    {
      value: VoteValue.MiddleFinger,
      weight: 23,
    },
    {
      value: VoteValue.Graive,
      weight: 24,
    },
    {
      value: VoteValue.Surf,
      weight: 25,
    },
  ];
  public readonly USER_EFFECT = UserEffect;
  public readonly ROOM_EFFECT = RoomEffect;

  public isUserEffectPlaying = false;

  private socket = new WebSocket(`${environment.prod ? 'wss' : 'ws'}://${environment.wsUrl}/web_socket`);

  public displayedColumns: string[] = ['name', 'vote'];
  public dataSource: Array<VoteElement> = [];

  public nameControl = new FormControl<string>(this.getUserNameFromLocalStorage() ?? '');
  private subs: Array<Subscription> = [];

  private readonly CONFETTI_FACTORY = confetti.create(document.getElementById('myCanvas') as HTMLCanvasElement, {
    resize: true,
    useWorker: true,
  });
  private readonly CONFETTI_BASIC_OPTIONS: confetti.Options = {
    particleCount: 200,
    spread: 70,
  };

  public roomEffect: RoomEffect | null = null;

  public ngOnInit(): void {
    this.handleSocketOpen();
    this.handleRoomUpdateMessages();
    this.subs.push(this.handleNameControlValueChanges());
  }

  public ngOnDestroy(): void {
    this.subs.forEach((sub) => sub.unsubscribe());
    this.socket.close();
  }

  public sendVote(vote: VoteValue): void {
    this.sendWebSocketMessage({ event: MessageType.UserVoteUpdate, data: vote });
  }

  public sendPhilippe(): void {
    this.sendWebSocketMessage({ event: MessageType.UserEffectUpdate, data: UserEffect.Philippe });
  }

  private sendConfetti(): void {
    this.roomEffect = RoomEffect.Fanfare;
    this.sendConfettis({
      angle: 45,
      origin: { x: -0.1, y: 1.1 },
    });
    this.sendConfettis({
      angle: 135,
      origin: { x: 1.1, y: 1.1 },
    });
    setTimeout(() => {
      this.roomEffect = null;
    }, 5000);
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
      try {
        const message: RoomMessage | PingMessage = JSON.parse(event.data);
        if (message.event === MessageType.RoomUpdate) {
          this.previousRoomState = this.roomState;
          this.roomState = message.data;
          this.updateDataSource();
          this.updateUserEffects();
          this.handleRoomEffects();
        }
      } catch (error) {
        console.error('Failed to parse websocket message');
      }
    });
  }

  private handleNameControlValueChanges(): Subscription {
    return this.nameControl.valueChanges.pipe(debounceTime(1000)).subscribe((name) => {
      if (name) {
        this.setUserNameToLocalStorage(name);
        this.sendUserName(name);
      }
    });
  }

  private sendWebSocketMessage(wsMessage: WebSocketMessage): void {
    try {
      const stringifiedMessage = JSON.stringify(wsMessage);
      this.socket.send(stringifiedMessage);
    } catch (error) {
      console.error('Failed to stringify websocket message before sending it');
    }
  }

  private setUserNameToLocalStorage(userName: string): void {
    globalThis.localStorage.setItem('userName', userName);
  }

  private getUserNameFromLocalStorage(): string | null {
    return globalThis.localStorage.getItem('userName');
  }

  private updateDataSource(): void {
    const newDataSource: Array<VoteElement> = [];
    // Fill data new data source
    this.roomState.users.forEach((user, index) => {
      newDataSource.push({ name: user.name, vote: this.VOTE_CARDS.find((vote) => vote.value === user.vote) ?? null, effect: user.effect });
      // Init user name if necessary
      if (!this.nameControl.value && index === this.roomState.users.length - 1) {
        this.nameControl.setValue(user.name);
      }
    });
    // Sort table if votes are not hidden
    if (!this.roomState.isHidden) {
      newDataSource.sort((a, b) => {
        const voteAWeight = a.vote?.weight ?? -1;
        const voteBWeight = b.vote?.weight ?? -1;
        return voteAWeight - voteBWeight;
      });
    }
    this.dataSource = newDataSource;
  }

  private updateUserEffects(): void {
    this.isUserEffectPlaying = this.roomState.users.some((user) => user.effect !== null);
  }

  private handleRoomEffects(): void {
    const usersWithVotes = this.roomState.users.filter((user) => user.vote);
    const usersHaveSameVote = new Set(usersWithVotes.map((user) => user.vote)).size === 1;
    if (
      this.previousRoomState.isHidden &&
      !this.roomState.isHidden &&
      usersWithVotes.length === this.roomState.users.length &&
      usersWithVotes.length >= 3 &&
      usersHaveSameVote
    ) {
      this.sendConfetti();
    }
  }

  private sendConfettis(options: confetti.Options): void {
    this.CONFETTI_FACTORY({ ...this.CONFETTI_BASIC_OPTIONS, ...options });
  }
}
