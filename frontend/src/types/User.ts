export type UserRole = 'Teacher' | 'Student';

export interface User {
  username: string;
  password: string;
  role: UserRole;
}