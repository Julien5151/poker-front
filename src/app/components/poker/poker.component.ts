import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTable, MatTableModule } from '@angular/material/table';
import { Subject, debounceTime, filter, takeUntil } from 'rxjs';
import { RoomEffect } from 'src/app/enums/room-effect.enum';
import { SocketEvent } from 'src/app/enums/socket-event.enum';
import { ConfettiService } from 'src/app/services/confetti.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { RoomService } from 'src/app/services/room.service';
import { WebSocketService } from 'src/app/services/web-socket.service';
import { UserEffect } from 'src/app/shared/enums/user-effect.enum';
import { VoteValue } from 'src/app/shared/enums/vote-value.enum';
import { RoomState } from 'src/app/shared/interfaces/room-state.interface';
import { Vote } from 'src/app/shared/interfaces/vote.interface';
import { USER_EFFECTS_MAP } from 'src/app/shared/maps/effects.map';
import { VOTE_VALUE_WEIGHT_MAP } from 'src/app/shared/maps/vote.map';
import { UserId } from 'src/app/shared/types/user-id.type';
import { SpeechBubbleComponent } from '../speech-bubble/speech-bubble.component';

export interface VoteElement {
  userId: UserId;
  name: string;
  vote: Vote | null;
  effect: UserEffect | null;
}

@Component({
  selector: 'poker',
  templateUrl: './poker.component.html',
  styleUrls: ['./poker.component.scss'],
  standalone: true,
  imports: [CommonModule, SpeechBubbleComponent, MatButtonModule, MatTableModule, MatInputModule, MatSelectModule, ReactiveFormsModule],
})
export class PokerComponent implements OnInit, OnDestroy {
  @Input() roomName = '';
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
  public readonly EFFECTS: Array<{ name: UserEffect; message: string }> = [
    { name: UserEffect.Philippe, message: USER_EFFECTS_MAP[UserEffect.Philippe].message },
    { name: UserEffect.Issou, message: USER_EFFECTS_MAP[UserEffect.Issou].message },
    { name: UserEffect.Arretez, message: USER_EFFECTS_MAP[UserEffect.Arretez].message },
  ];
  public readonly USER_EFFECT = UserEffect;
  public readonly ROOM_EFFECT = RoomEffect;
  // Room
  public roomState: RoomState = {
    name: '',
    users: [],
    isHidden: true,
  };
  // Effects
  public isUserEffectPlaying = false;
  public roomEffect: RoomEffect | null = null;
  // Data table
  @ViewChild('dataTable') dataTableRef!: MatTable<VoteElement>;
  public displayedColumns: string[] = ['name', 'vote'];
  public dataSource: Array<VoteElement> = [];
  // Controls
  public nameControl = new FormControl<string>(this.localStorageService.getUserNameFromLocalStorage() ?? '');
  public userEffectControl = new FormControl<UserEffect | null>(null);
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
    this.handleUserEffectControlValueChanges();
  }

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.webSocketService.closeWebSocket();
  }

  // UI event handlers
  public sendVote(vote: VoteValue): void {
    this.webSocketService.sendVoteMessage(vote);
  }

  public sendUserEffect(effect: UserEffect): void {
    this.userEffectControl.disable({ emitEvent: false });
    this.webSocketService.sendUserEffectMessage(effect);
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
      this.webSocketService.sendUserJoinRoomMessage(this.roomName);
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

  private handleUserEffectControlValueChanges(): void {
    this.userEffectControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((effect) => {
      if (effect) {
        this.sendUserEffect(effect);
        this.userEffectControl.disable({ emitEvent: false });
      }
    });
  }

  private updateDataSource(): void {
    // Update or remove votes
    this.dataSource.forEach((vote, index) => {
      const userWithVote = this.roomState.users.find((user) => user.id === vote.userId);
      // User no longer exists in room, remove from data source
      if (!userWithVote) {
        this.dataSource.splice(index, 1);
      } else {
        // User still exists in room, update its item
        vote.name = userWithVote.name;
        vote.vote = userWithVote.vote;
        vote.effect = userWithVote.effect;
      }
    });
    // Add new users
    const newUsers = this.roomState.users.filter((user) => !this.dataSource.map((voteItem) => voteItem.userId).includes(user.id));
    newUsers.forEach((user, index) => {
      const { id, name, vote, effect } = user;
      this.dataSource.push({ userId: id, name, vote, effect });
      if (!this.nameControl.value && index === newUsers.length - 1) {
        this.nameControl.setValue(user.name);
      }
    });
    // Sort table if votes are not hidden
    if (!this.roomState.isHidden) {
      this.dataSource.sort((a, b) => {
        const voteAWeight = a.vote?.weight ?? -1;
        const voteBWeight = b.vote?.weight ?? -1;
        return voteAWeight - voteBWeight;
      });
    }
    // TO DO INIT VALUE IN CONTROL
    this.dataTableRef?.renderRows();
  }

  private updateUserEffects(): void {
    this.isUserEffectPlaying = this.roomState.users.some((user) => user.effect !== null);
    if (!this.isUserEffectPlaying) {
      this.userEffectControl.reset();
      this.userEffectControl.enable();
    }
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
