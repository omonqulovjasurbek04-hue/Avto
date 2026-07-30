export type ViewType = 'home' | 'lessons' | 'practice' | 'exam' | 'analytics' | 'admin' | 'mobile';

export interface UserProfile {
  name: string;
  email: string;
  role?: 'USER' | 'ADMIN';
  isLoggedIn: boolean;
  isPremium: boolean;
}
