import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject, debounceTime, filter, takeUntil } from 'rxjs';
import { RoomEffect } from './enums/room-effect.enum';
import { SocketEvent } from './enums/socket-event.enum';
import { ConfettiService } from './services/confetti.service';
import { LocalStorageService } from './services/local-storage.service';
import { RoomService } from './services/room.service';
import { WebSocketService } from './services/web-socket.service';
import { UserEffect } from './shared/enums/user-effect.enum';
import { VoteValue } from './shared/enums/vote-value.enum';
import { RoomState } from './shared/interfaces/room-state.interface';
import { Vote } from './shared/interfaces/vote.interface';
import { VOTE_VALUE_WEIGHT_MAP } from './shared/maps/vote.map';

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
  // Constants
  public readonly VOTE_CARDS: Array<Vote> = [
    {
      value: VoteValue.One,
      weight: VOTE_VALUE_WEIGHT_MAP[VoteValue.One],
    },
    {
      value: VoteValue.Two,
      weight: VOTE_VALUE_WEIGHT_MAP[VoteValue.Two],
    },
    {
      value: VoteValue.Three,
      weight: VOTE_VALUE_WEIGHT_MAP[VoteValue.Three],
    },
    {
      value: VoteValue.Five,
      weight: VOTE_VALUE_WEIGHT_MAP[VoteValue.Five],
    },
    {
      value: VoteValue.Eight,
      weight: VOTE_VALUE_WEIGHT_MAP[VoteValue.Eight],
    },
    {
      value: VoteValue.Thirteen,
      weight: VOTE_VALUE_WEIGHT_MAP[VoteValue.Thirteen],
    },
    {
      value: VoteValue.TwentyOne,
      weight: VOTE_VALUE_WEIGHT_MAP[VoteValue.TwentyOne],
    },
    {
      value: VoteValue.Shrug,
      weight: VOTE_VALUE_WEIGHT_MAP[VoteValue.Shrug],
    },
    {
      value: VoteValue.Graive,
      weight: VOTE_VALUE_WEIGHT_MAP[VoteValue.Graive],
    },
    {
      value: VoteValue.MiddleFinger,
      weight: VOTE_VALUE_WEIGHT_MAP[VoteValue.MiddleFinger],
    },
    {
      value: VoteValue.Surf,
      weight: VOTE_VALUE_WEIGHT_MAP[VoteValue.Surf],
    },
  ];
  public readonly USER_EFFECT = UserEffect;
  public readonly ROOM_EFFECT = RoomEffect;
  // Room
  public roomState: RoomState | null = null;
  // Effects
  public isUserEffectPlaying = false;
  public roomEffect: RoomEffect | null = null;
  // Data table
  public displayedColumns: string[] = ['name', 'vote'];
  public dataSource: Array<VoteElement> = [];
  // Controls
  public nameControl = new FormControl<string>(this.localStorageService.getUserNameFromLocalStorage() ?? '');
  // Subscriptions
  private destroy$ = new Subject<boolean>();

  // Service subjects
  private socketEvent$ = this.webSocketService.socketEvent$.pipe(takeUntil(this.destroy$));
  private roomStateEvent$ = this.roomService.roomStateEvent$.pipe(takeUntil(this.destroy$));

  constructor(
    private readonly webSocketService: WebSocketService,
    private readonly roomService: RoomService,
    private readonly confettiService: ConfettiService,
    private readonly localStorageService: LocalStorageService,
  ) {}

  public ngOnInit(): void {
    this.webSocketService.initWebSocket();
    this.handleSocketOpen();
    this.handleRoomUpdateMessages();
    this.handleNameControlValueChanges();
  }

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.webSocketService.closeWebSocket();
  }

  // UI event handlers
  public sendVote(vote: VoteValue): void {
    this.webSocketService.sendVoteMessage(vote);
  }

  public sendPhilippe(): void {
    this.webSocketService.sendUserEffectMessage(UserEffect.Philippe);
  }

  public toggleHide(): void {
    this.webSocketService.sendToggleHideMessage();
  }

  public resetVotes(): void {
    this.webSocketService.sendResetVotesMessage();
  }

  // Web socket handlers
  private handleSocketOpen(): void {
    this.socketEvent$.pipe(filter((event) => event.type === SocketEvent.Open)).subscribe(() => {
      // TO DO : REWORK INIT OF ROOM
      const initialRoom = `philippe_${Math.floor(Math.random() * 100000)}-room`;
      this.webSocketService.sendUserJoinRoomMessage(initialRoom);
      const userName = this.nameControl.value;
      if (userName) this.webSocketService.sendUserNameUpdateMessage(userName);
    });
  }

  private handleRoomUpdateMessages(): void {
    this.roomStateEvent$.subscribe((roomState) => {
      this.roomState = roomState;
      this.updateDataSource();
      this.updateUserEffects();
      this.handleRoomEffects();
    });
  }

  // Control handlers
  private handleNameControlValueChanges(): void {
    this.nameControl.valueChanges.pipe(debounceTime(1000), takeUntil(this.destroy$)).subscribe((name) => {
      if (name) {
        this.localStorageService.setUserNameToLocalStorage(name);
        this.webSocketService.sendUserNameUpdateMessage(name);
      }
    });
  }

  private updateDataSource(): void {
    const newDataSource: Array<VoteElement> = [];
    // Fill data new data source
    this.roomState.users.forEach((user, index) => {
      newDataSource.push({ name: user.name, vote: this.VOTE_CARDS.find((vote) => vote.value === user.vote?.value) ?? null, effect: user.effect });
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
      this.roomService.previousRoomState.isHidden &&
      !this.roomState.isHidden &&
      usersWithVotes.length === this.roomState.users.length &&
      usersWithVotes.length >= 3 &&
      usersHaveSameVote
    ) {
      this.sendConfetti();
    }
  }

  private sendConfetti(): void {
    this.roomEffect = RoomEffect.Fanfare;
    this.confettiService.sendConfettisFromBottomCorners();
    setTimeout(() => {
      this.roomEffect = null;
    }, 5000);
  }
}
