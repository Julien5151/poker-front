import { UserEffect } from '../shared/enums/user-effect.enum';

export const USER_EFFECTS_SOUND_MAP: Record<UserEffect, string> = {
  [UserEffect.Philippe]: 'philippe.mp3',
  [UserEffect.Issou]: 'issou.mp3',
  [UserEffect.Arretez]: 'arretez.mp3',
  [UserEffect.PutainGenial]: 'putain-genial.mp3',
};
