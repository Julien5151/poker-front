import { RoomEffect } from '../enums/room-effect.enum';

export type Duration = number;

export const ROOM_EFFECT_DURATIONS_MAP: Record<RoomEffect, Duration> = {
  [RoomEffect.Fanfare]: 5000,
  [RoomEffect.Ignition]: 10000,
  [RoomEffect.Explosion]: 3000,
  [RoomEffect.Chenille]: 31000,
  [RoomEffect.NoFun]: 3600000,
};
