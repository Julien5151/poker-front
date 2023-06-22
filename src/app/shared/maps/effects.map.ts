import { UserEffect } from '../enums/user-effect.enum';
import { UserEffectData } from '../interfaces/user-effect-data.interface';

export const USER_EFFECTS_MAP: Record<UserEffect, UserEffectData> = {
  [UserEffect.Philippe]: { duration: 1500, volume: 0.3, message: 'Philippe !' },
  [UserEffect.Issou]: { duration: 3100, volume: 0.7, message: 'Issou !' },
  [UserEffect.Arretez]: { duration: 2500, volume: 0.9, message: 'Arrêtez !' },
};
