import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTable, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { Subject, debounceTime, filter, firstValueFrom, map, takeUntil } from 'rxjs';
import { SocketEvent } from 'src/app/enums/socket-event.enum';
import { ConfettiService } from 'src/app/services/confetti.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { SpotService } from 'src/app/services/spot.service';
import { WebSocketService } from 'src/app/services/web-socket.service';
import { RoomEffect } from 'src/app/shared/enums/room-effect.enum';
import { UserAction } from 'src/app/shared/enums/user-action.enum';
import { UserEffect } from 'src/app/shared/enums/user-effect.enum';
import { VoteValue } from 'src/app/shared/enums/vote-value.enum';
import { RoomState } from 'src/app/shared/interfaces/room-state.interface';
import { User } from 'src/app/shared/interfaces/user.interface';
import { Vote } from 'src/app/shared/interfaces/vote.interface';
import { USER_EFFECTS_MAP } from 'src/app/shared/maps/effects.map';
import { VOTE_VALUE_WEIGHT_MAP } from 'src/app/shared/maps/vote.map';
import { UserId } from 'src/app/shared/types/user-id.type';
import { ChenilleActivatorComponent } from '../chenille-activator/chenille-activator.component';
import { CountdownComponent } from '../countdown/countdown.component';
import { JoinRoomDialogComponent } from '../dialogs/join-room-dialog/join-room-dialog.component';
import { NuclearActivatorComponent } from '../nuclear-activator/nuclear-activator.component';
import { NuclearExplosionComponent } from '../nuclear-explosion/nuclear-explosion.component';
import { SpeechBubbleComponent } from '../speech-bubble/speech-bubble.component';

@Component({
  selector: 'poker',
  templateUrl: './poker.component.html',
  styleUrls: ['./poker.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    SpeechBubbleComponent,
    MatButtonModule,
    MatTableModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    NuclearExplosionComponent,
    NuclearActivatorComponent,
    CountdownComponent,
    ChenilleActivatorComponent,
  ],
})
export class PokerComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren('spot', { read: ElementRef }) spots!: QueryList<ElementRef>;
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
    { name: UserEffect.PutainGenial, message: USER_EFFECTS_MAP[UserEffect.PutainGenial].message },
    { name: UserEffect.Leviosa, message: USER_EFFECTS_MAP[UserEffect.Leviosa].message },
    { name: UserEffect.OhYeah, message: USER_EFFECTS_MAP[UserEffect.OhYeah].message },
  ];
  public readonly USER_EFFECT = UserEffect;
  public readonly USER_ACTION = UserAction;
  public readonly ROOM_EFFECT = RoomEffect;
  // Room
  public roomState: RoomState = {
    name: '',
    users: [],
    isHidden: true,
    roomEffect: null,
    roomEffectCoolDowns: {
      [RoomEffect.Fanfare]: 0,
      [RoomEffect.Ignition]: 0,
      [RoomEffect.Explosion]: 0,
      [RoomEffect.Chenille]: 0,
    },
  };
  // User
  public userId: UserId = '';
  // Activators
  public ignitionButtonActivated = true;
  public chenilleButtonActivated = true;
  // Effects
  public isUserEffectPlaying = false;
  private isRoomEffectPlaying = false;
  // Nuclear effects
  public isIgnitionReloading = false;
  public isWasteLand = false;
  public isLaunchAuthorized = false;
  // Chenille effects
  public isChenilleIgnitionReloading = false;
  // Data table
  @ViewChild('dataTable') dataTableRef!: MatTable<User>;
  public displayedColumns: string[] = ['name', 'vote'];
  public dataSource: Array<User> = [];
  // Controls
  public nameControl = new FormControl<string>(this.localStorageService.getUserNameFromLocalStorage() ?? '');
  public userEffectControl = new FormControl<UserEffect | null>(null);
  // Subscriptions
  private destroy$ = new Subject<boolean>();

  // Service subjects
  private socketEvent$ = this.webSocketService.socketEvent$.pipe(takeUntil(this.destroy$));
  private roomStateEvent$ = this.webSocketService.roomStateEvent$.pipe(takeUntil(this.destroy$));
  private userEvent$ = this.webSocketService.userEvent$.pipe(takeUntil(this.destroy$));

  constructor(
    private readonly webSocketService: WebSocketService,
    private readonly confettiService: ConfettiService,
    private readonly spotService: SpotService,
    private readonly localStorageService: LocalStorageService,
    private readonly dialogService: MatDialog,
    private readonly router: Router,
  ) {}

  public ngOnInit(): void {
    this.webSocketService.initWebSocket();
    this.handleSocketOpen();
    this.handleRoomUpdateMessages();
    this.handleUserMessages();
    this.handleNameControlValueChanges();
    this.handleUserEffectControlValueChanges();
    this.localStorageService.setRoomNameToLocalStorage(this.roomName);
  }

  ngAfterViewInit(): void {
    const spots = this.spots.toArray();
    if (spots.length > 0) this.spotService.initSpots(this.spots.map((elRef) => elRef.nativeElement));
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

  public async joinRoom(): Promise<void> {
    await firstValueFrom(
      this.dialogService
        .open(JoinRoomDialogComponent)
        .afterClosed()
        .pipe(
          map((roomName: string | null) => {
            if (roomName) {
              this.router.navigate([`/poker/${roomName}`]);
              this.localStorageService.setRoomNameToLocalStorage(roomName);
            }
          }),
        ),
    );
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
      this.updateNuclearEffects();
      this.updateChenilleEffects();
    });
  }

  private handleUserMessages(): void {
    this.userEvent$.subscribe((userId) => {
      this.userId = userId;
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

  private updateNuclearEffects(): void {
    const currentTimestamp = new Date().getTime();
    const roomState = this.roomState;
    this.isWasteLand = roomState.roomEffectCoolDowns[RoomEffect.Explosion] > currentTimestamp;
    this.isIgnitionReloading = roomState.roomEffect !== RoomEffect.Ignition && roomState.roomEffectCoolDowns[RoomEffect.Ignition] > currentTimestamp;
    this.isLaunchAuthorized = roomState.users.filter((user) => user.action === UserAction.NuclearIgnition).length >= 3;
  }

  private updateChenilleEffects(): void {
    const currentTimestamp = new Date().getTime();
    const roomState = this.roomState;
    if (roomState.roomEffect !== RoomEffect.Chenille) {
      this.confettiService.clearConfettiInterval();
      this.spotService.finishTheShow();
    }
    this.isChenilleIgnitionReloading =
      roomState.roomEffect !== RoomEffect.Chenille && roomState.roomEffectCoolDowns[RoomEffect.Chenille] > currentTimestamp;
  }

  private updateDataSource(): void {
    // Update or remove votes
    this.dataSource.forEach((user, index) => {
      const userWithVote = this.roomState.users.find((usr) => usr.id === user.id);
      // User no longer exists in room, remove from data source
      if (!userWithVote) {
        this.dataSource.splice(index, 1);
      } else {
        // User still exists in room, update its item
        user.name = userWithVote.name;
        user.vote = userWithVote.vote;
        user.effect = userWithVote.effect;
        user.action = userWithVote.action;
      }
    });
    // Add new users
    const newUsers = this.roomState.users.filter((user) => !this.dataSource.map((usr) => usr.id).includes(user.id));
    newUsers.forEach((user, index) => {
      this.dataSource.push(user);
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
    this.dataTableRef?.renderRows();
  }

  private updateUserEffects(): void {
    this.isUserEffectPlaying = this.roomState.users.some((user) => user.effect !== null);
    if (!this.isUserEffectPlaying) {
      this.userEffectControl.reset();
      this.userEffectControl.enable();
    }
    const userAction = this.roomState.users.find((user) => user.id === this.userId)?.action;
    this.ignitionButtonActivated = !userAction;
    this.chenilleButtonActivated = !userAction;
  }

  private handleRoomEffects(): void {
    const roomEffect = this.roomState.roomEffect;
    if (!roomEffect) {
      this.isRoomEffectPlaying = false;
      return;
    }
    if (this.isRoomEffectPlaying) return;
    switch (roomEffect) {
      case RoomEffect.Fanfare:
        this.confettiService.sendConfettisFromBottomCorners();
        break;
      case RoomEffect.Chenille:
        this.confettiService.sendConfettisFromTop();
        this.spotService.startTheShow();
        break;
    }
    this.isRoomEffectPlaying = true;
  }
}
