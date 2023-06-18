import { VoteValue } from '../enums/vote-value.enum';

export interface Vote {
  value: VoteValue;
  weight: number;
}
