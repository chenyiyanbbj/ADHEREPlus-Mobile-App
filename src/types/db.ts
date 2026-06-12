export type Role = "patient" | "doctor" | "admin";
export type UserStatus = "active" | "inactive";
export type DoseStatus = "pending" | "taken" | "missed";
export type ScheduleFrequency = "daily" | "weekly";
export type WeekdayCode = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

export interface UserRecord {
  id: string;
  auth_id: string;
  login_id: string;
  role: Role;
  status: UserStatus;
  created_by: string | null;
  password_reset_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PatientProfileRecord {
  id: string;
  user_id: string;
  age_group: string;
  preferred_language: "ja" | "en" | "zh";
  created_at: string;
  updated_at: string;
}

export interface MedicationRecord {
  id: string;
  patient_id: string;
  medication_name: string;
  dosage: string;
  form: "capsule" | "tablet" | "softgel";
  color_label: string;
  is_active: boolean;
  created_by_user_id: string;
  created_at: string;
  updated_at: string;
}

export interface MedicationScheduleRecord {
  id: string;
  medication_id: string;
  patient_id: string;
  scheduled_time: string;
  frequency: ScheduleFrequency;
  weekdays: WeekdayCode[] | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DoseEventRecord {
  id: string;
  patient_id: string;
  medication_id: string;
  schedule_id: string;
  scheduled_datetime: string;
  taken_datetime: string | null;
  status: DoseStatus;
  source: "app_button" | "notification_action" | "system_check";
  created_at: string;
  updated_at: string;
}

export interface DigitalPassportRecord {
  id: string;
  patient_id: string;
  organ: string;
  transplant_date: string;
  allergies: string;
  emergency_contact: string;
  emergency_notes: string;
  updated_by_user_id: string;
  created_at: string;
  updated_at: string;
}
