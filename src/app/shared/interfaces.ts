import { MessageType, UserEffect, VoteValue } from './enums';

export interface User {
  id: string;
  name: string;
  vote: VoteValue | null;
  effect: UserEffect | null;
}

export interface Vote {
  value: VoteValue;
  weight: number;
}

export interface RoomState {
  users: User[];
  isHidden: boolean;
}

export type WebSocketMessage = RoomMessage | UserVoteMessage | UserNameMessage | UserEffectMessage | HiddenMessage | ResetVotesMessage | PingMessage;

export interface RoomMessage {
  event: MessageType.RoomUpdate;
  data: RoomState;
}

export interface UserVoteMessage {
  event: MessageType.UserVoteUpdate;
  data: VoteValue;
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

export interface PingMessage {
  event: MessageType.Ping;
}
