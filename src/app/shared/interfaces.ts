import { MessageType, UserEffect, Vote } from './enums';

export interface User {
  id: string;
  name: string;
  vote: Vote | null;
  effect: UserEffect | null;
}

export interface RoomState {
  users: User[];
  isHidden: boolean;
}

export type WebSocketMessage = RoomMessage | UserVoteMessage | UserNameMessage | UserEffectMessage | HiddenMessage | ResetVotesMessage;

export interface RoomMessage {
  event: MessageType.RoomUpdate;
  data: RoomState;
}

export interface UserVoteMessage {
  event: MessageType.UserVoteUpdate;
  data: Vote;
}

export interface UserNameMessage {
  event: MessageType.UserNameUpdate;
  data: string;
}

export interface UserEffectMessage {
  event: MessageType.UserEffectUpdate;
  data: UserEffect;
}

export interface HiddenMessage {
  event: MessageType.HiddenUpdate;
}

export interface ResetVotesMessage {
  event: MessageType.ResetVotes;
}
