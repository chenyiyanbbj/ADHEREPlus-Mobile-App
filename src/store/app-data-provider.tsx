import { createContext, type ReactNode, useContext, useMemo, useState } from "react";

import { todayKey } from "@/lib/dates";
import { mockDoseEvents, mockMedications, mockPassport, mockPatientProfile, mockSchedules, mockUser } from "@/store/mock-data";
import { gradientForColor } from "@/store/selectors";
import type { DigitalPassportRecord, DoseEventRecord, MedicationRecord, MedicationScheduleRecord } from "@/types/db";

interface MedicationDetails {
  medication: MedicationRecord;
  schedules: MedicationScheduleRecord[];
}

interface TodayDoseItem {
  medication: MedicationRecord;
  schedule: MedicationScheduleRecord;
  doseEvent: DoseEventRecord;
  gradientTo: string;
}

interface AppDataContextShape {
  currentPatient: {
    user: typeof mockUser;
    profile: typeof mockPatientProfile;
  };
  medications: MedicationRecord[];
  schedules: MedicationScheduleRecord[];
  doseEvents: DoseEventRecord[];
  passport: DigitalPassportRecord;
  activeMedications: MedicationRecord[];
  todayDoseItems: TodayDoseItem[];
  notificationSummary: { enabled: number };
  markDoseTaken: (doseEventId: string) => void;
  createMedication: (input: {
    medication_name: string;
    dosage: string;
    form: MedicationRecord["form"];
    scheduledTimes: string[];
  }) => void;
  updateMedication: (medicationId: string, patch: Partial<MedicationRecord>) => void;
  findMedicationById: (medicationId?: string) => MedicationDetails | null;
}

const AppDataContext = createContext<AppDataContextShape | undefined>(undefined);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [medications, setMedications] = useState<MedicationRecord[]>(mockMedications);
  const [schedules, setSchedules] = useState<MedicationScheduleRecord[]>(mockSchedules);
  const [doseEvents, setDoseEvents] = useState<DoseEventRecord[]>(mockDoseEvents);
  const [passport] = useState<DigitalPassportRecord>(mockPassport);

  const activeMedications = useMemo(() => medications.filter((item) => item.is_active), [medications]);
  const todayDoseItems = useMemo<TodayDoseItem[]>(() => {
    const today = todayKey();
    return schedules
      .filter((schedule) => schedule.is_active)
      .map((schedule) => {
        const medication = medications.find((item) => item.id === schedule.medication_id);
        const doseEvent = doseEvents.find(
          (event) => event.schedule_id === schedule.id && event.scheduled_datetime.slice(0, 10) === today,
        );

        if (!medication || !doseEvent || !medication.is_active) {
          return null;
        }

        return {
          medication,
          schedule,
          doseEvent,
          gradientTo: gradientForColor(medication.color_label),
        };
      })
      .filter(Boolean)
      .sort((a, b) => a!.schedule.scheduled_time.localeCompare(b!.schedule.scheduled_time)) as TodayDoseItem[];
  }, [doseEvents, medications, schedules]);

  const value = useMemo<AppDataContextShape>(
    () => ({
      currentPatient: { user: mockUser, profile: mockPatientProfile },
      medications,
      schedules,
      doseEvents,
      passport,
      activeMedications,
      todayDoseItems,
      notificationSummary: { enabled: schedules.filter((item) => item.is_active).length },
      markDoseTaken(doseEventId) {
        setDoseEvents((current) =>
          current.map((item) =>
            item.id === doseEventId
              ? { ...item, status: "taken", taken_datetime: new Date().toISOString(), updated_at: new Date().toISOString(), source: "app_button" }
              : item,
          ),
        );
      },
      createMedication(input) {
        const medicationId = `med-${Date.now()}`;
        const createdAt = new Date().toISOString();

        const newMedication: MedicationRecord = {
          id: medicationId,
          patient_id: mockPatientProfile.id,
          medication_name: input.medication_name,
          dosage: input.dosage,
          form: input.form,
          color_label: "#5B7C99",
          is_active: true,
          created_by_user_id: mockUser.id,
          created_at: createdAt,
          updated_at: createdAt,
        };

        const newSchedules = input.scheduledTimes.map((time, index) => ({
          id: `${medicationId}-schedule-${index}`,
          medication_id: medicationId,
          patient_id: mockPatientProfile.id,
          scheduled_time: time,
          frequency: "daily" as const,
          start_date: todayKey(),
          end_date: null,
          is_active: true,
          created_at: createdAt,
          updated_at: createdAt,
        }));

        const newDoseEvents = newSchedules.map((schedule) => ({
          id: `dose-${schedule.id}-${todayKey()}`,
          patient_id: schedule.patient_id,
          medication_id: medicationId,
          schedule_id: schedule.id,
          scheduled_datetime: `${todayKey()}T${schedule.scheduled_time}:00.000Z`,
          taken_datetime: null,
          status: "pending" as const,
          source: "system_check" as const,
          created_at: createdAt,
          updated_at: createdAt,
        }));

        setMedications((current) => [...current, newMedication]);
        setSchedules((current) => [...current, ...newSchedules]);
        setDoseEvents((current) => [...current, ...newDoseEvents]);
      },
      updateMedication(medicationId, patch) {
        setMedications((current) =>
          current.map((item) => (item.id === medicationId ? { ...item, ...patch, updated_at: new Date().toISOString() } : item)),
        );
      },
      findMedicationById(medicationId) {
        if (!medicationId) {
          return null;
        }

        const medication = medications.find((item) => item.id === medicationId);
        if (!medication) {
          return null;
        }

        return {
          medication,
          schedules: schedules.filter((item) => item.medication_id === medicationId),
        };
      },
    }),
    [activeMedications, doseEvents, medications, passport, schedules, todayDoseItems],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);

  if (!context) {
    throw new Error("useAppData must be used inside AppDataProvider");
  }

  return context;
}
