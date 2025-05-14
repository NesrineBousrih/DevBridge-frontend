// core/models/user.ts
export class User {
  id?: number;
  username: string;
  password: string;
  user_type: string;
  email: string;
  profile_photo?: string;
  constructor(
    username: string,
    password: string,
    user_type: string = 'developer',
    email: string = ''
  ) {
    this.username = username;
    this.password = password;
    this.user_type = user_type;
    this.email = email;
  }
}