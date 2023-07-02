import { UserAction } from '../enums/user-action.enum';
import { UserEffect } from '../enums/user-effect.enum';
import { UserId } from '../types/user-id.type';
import { Vote } from './vote.interface';

export interface User {
  id: UserId;
  name: string;
  vote: Vote | null;
  effect: UserEffect | null;
  action: UserAction | null;
}
