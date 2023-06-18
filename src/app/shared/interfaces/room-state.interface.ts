import { RoomName } from '../types/room-name.type';
import { User } from './user.interface';

export interface RoomState {
  name: RoomName;
  users: User[];
  isHidden: boolean;
}
