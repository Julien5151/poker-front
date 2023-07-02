import { RoomEffect } from '../enums/room-effect.enum';
import { CoolDownTimestamp } from '../types/cooldown-timestamp.type';
import { RoomName } from '../types/room-name.type';
import { User } from './user.interface';

export interface RoomState {
  name: RoomName;
  users: User[];
  isHidden: boolean;
  roomEffect: RoomEffect | null;
  roomEffectCoolDowns: Record<RoomEffect, CoolDownTimestamp>;
}
