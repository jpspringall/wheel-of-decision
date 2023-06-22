import { User } from './user.model';

export interface UserList {
  partitionKeyValue: string;
  users: User[];
}
