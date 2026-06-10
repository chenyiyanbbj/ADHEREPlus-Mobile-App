import type {
  DigitalPassportRecord,
  DoseEventRecord,
  MedicationRecord,
  MedicationScheduleRecord,
  PatientProfileRecord,
  UserRecord,
} from "@/types/db";

import { isoNow, todayKey } from "@/lib/dates";

const now = isoNow();
const patientUserId = "user-patient-1";
const patientProfileId = "patient-profile-1";

export const mockUser: UserRecord = {
  id: patientUserId,
  auth_id: "auth-patient-1",
  login_id: "TX-20847",
  role: "patient",
  status: "active",
  created_by: "user-doctor-1",
  password_reset_at: null,
  created_at: now,
  updated_at: now,
};

export const mockPatientProfile: PatientProfileRecord = {
  id: patientProfileId,
  user_id: patientUserId,
  age_group: "50s",
  preferred_language: "ja",
  created_at: now,
  updated_at: now,
};

export const mockMedications: MedicationRecord[] = [
  {
    id: "med-1",
    patient_id: patientProfileId,
    medication_name: "Tacrolimus",
    dosage: "2 mg",
    form: "capsule",
    color_label: "#9D8BD7",
    is_active: true,
    created_by_user_id: patientUserId,
    created_at: now,
    updated_at: now,
  },
  {
    id: "med-2",
    patient_id: patientProfileId,
    medication_name: "Mycophenolate",
    dosage: "500 mg",
    form: "tablet",
    color_label: "#E3A16B",
    is_active: true,
    created_by_user_id: patientUserId,
    created_at: now,
    updated_at: now,
  },
  {
    id: "med-3",
    patient_id: patientProfileId,
    medication_name: "Prednisone",
    dosage: "5 mg",
    form: "tablet",
    color_label: "#81C6BE",
    is_active: true,
    created_by_user_id: patientUserId,
    created_at: now,
    updated_at: now,
  },
];

export const mockSchedules: MedicationScheduleRecord[] = [
  { id: "sch-1", medication_id: "med-1", patient_id: patientProfileId, scheduled_time: "08:00", frequency: "daily", start_date: todayKey(), end_date: null, is_active: true, created_at: now, updated_at: now },
  { id: "sch-2", medication_id: "med-1", patient_id: patientProfileId, scheduled_time: "20:00", frequency: "daily", start_date: todayKey(), end_date: null, is_active: true, created_at: now, updated_at: now },
  { id: "sch-3", medication_id: "med-2", patient_id: patientProfileId, scheduled_time: "08:00", frequency: "daily", start_date: todayKey(), end_date: null, is_active: true, created_at: now, updated_at: now },
  { id: "sch-4", medication_id: "med-2", patient_id: patientProfileId, scheduled_time: "20:00", frequency: "daily", start_date: todayKey(), end_date: null, is_active: true, created_at: now, updated_at: now },
  { id: "sch-5", medication_id: "med-3", patient_id: patientProfileId, scheduled_time: "12:00", frequency: "daily", start_date: todayKey(), end_date: null, is_active: true, created_at: now, updated_at: now },
];

function generateDoseEvents(): DoseEventRecord[] {
  const today = todayKey();
  const events: DoseEventRecord[] = [];

  for (let daysAgo = 6; daysAgo >= 0; daysAgo -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    const dateKey = date.toISOString().slice(0, 10);

    for (const schedule of mockSchedules) {
      const scheduledDatetime = `${dateKey}T${schedule.scheduled_time}:00.000Z`;
      const morning = Number(schedule.scheduled_time.slice(0, 2)) <= 9;
      const status = daysAgo === 0 ? (morning ? "taken" : "pending") : daysAgo === 3 ? "missed" : "taken";
      const takenDatetime = status === "taken" ? scheduledDatetime : null;

      events.push({
        id: `dose-${schedule.id}-${dateKey}`,
        patient_id: schedule.patient_id,
        medication_id: schedule.medication_id,
        schedule_id: schedule.id,
        scheduled_datetime: scheduledDatetime,
        taken_datetime: takenDatetime,
        status,
        source: status === "taken" ? "app_button" : "system_check",
        created_at: now,
        updated_at: now,
      });
    }
  }

  return events;
}

export const mockDoseEvents = generateDoseEvents();

export const mockPassport: DigitalPassportRecord = {
  id: "passport-1",
  patient_id: patientProfileId,
  organ: "Kidney",
  transplant_date: "2025-03-15",
  allergies: "Penicillin, Sulfa drugs",
  emergency_contact: "Yuki Tanaka (Spouse) · +81 90-1234-5678",
  emergency_notes: "Patient prefers communication in Japanese. Contact family before non-emergency procedures.",
  updated_by_user_id: patientUserId,
  created_at: now,
  updated_at: now,
};
