export type UserRole = 'Admin' | 'Student';

export interface User {
  username: string;
  password: string;
  role: UserRole;
}