// core/models/user.ts
export class User {
  id?: number;
  username: string;
  password: string;
  current_password?: string;
  user_type: string;
  email: string;
  profile_photo?: string;
  
  // Developer-specific attributes
  expertise?: string;
  experience_years?: number; // Changed from experienceYears to match backend

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