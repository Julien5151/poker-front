import { UserEffect } from '../enums/user-effect.enum';
import { UserEffectData } from '../interfaces/user-effect-data.interface';

export const USER_EFFECTS_MAP: Record<UserEffect, UserEffectData> = {
  [UserEffect.Philippe]: { duration: 1500, volume: 0.3, message: 'Philippe !' },
  [UserEffect.Issou]: { duration: 3100, volume: 0.5, message: 'Issou !' },
  [UserEffect.Arretez]: { duration: 2500, volume: 0.8, message: 'Arrêtez !' },
  [UserEffect.PutainGenial]: { duration: 1467, volume: 0.2, message: 'Génial !' },
  [UserEffect.Leviosa]: { duration: 3000, volume: 0.5, message: 'Leviosa !' },
  [UserEffect.OhYeah]: { duration: 3000, volume: 0.4, message: 'Oh Yeah !' },
};
