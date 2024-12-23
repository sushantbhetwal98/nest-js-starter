export interface userInterface {
  id: string;
  is_active: boolean;
  is_archived: boolean;
  created_at: Date;
  updated_at: Date;
  first_name: string;
  last_name: string;
  middle_name?: string;
  email: string;
  otp_expiry: Date;
  password: string;
  password_salt: string;
  otp: string;
}
