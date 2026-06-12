import { createContext, type ReactNode, useContext, useMemo, useState } from "react";

import { todayKey } from "@/lib/dates";
import { isScheduleDueOnDate, normalizeScheduledTimes, normalizeWeekdays } from "@/lib/medications";
import { mockDoseEvents, mockMedications, mockPassport, mockPatientProfile, mockSchedules, mockUser } from "@/store/mock-data";
import { gradientForColor } from "@/store/selectors";
import type { DigitalPassportRecord, DoseEventRecord, MedicationRecord, MedicationScheduleRecord, WeekdayCode } from "@/types/db";

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
    color_label: string;
    frequency: MedicationScheduleRecord["frequency"];
    weekdays: WeekdayCode[];
    scheduledTimes: string[];
  }) => void;
  updateMedication: (
    medicationId: string,
    patch: Partial<MedicationRecord>,
    scheduledTimes?: string[],
    frequency?: MedicationScheduleRecord["frequency"],
    weekdays?: WeekdayCode[],
  ) => void;
  findMedicationById: (medicationId?: string) => MedicationDetails | null;
}

const AppDataContext = createContext<AppDataContextShape | undefined>(undefined);

function buildMedicationSchedules(
  medicationId: string,
  scheduledTimes: string[],
  frequency: MedicationScheduleRecord["frequency"],
  weekdays: WeekdayCode[],
  createdAt: string,
) {
  const normalizedTimes = normalizeScheduledTimes(scheduledTimes, Math.max(1, Math.min(5, scheduledTimes.length || 1))).sort((a, b) =>
    a.localeCompare(b),
  );
  const normalizedWeekdays = frequency === "weekly" ? normalizeWeekdays(weekdays) : [];

  return normalizedTimes.map((time, index) => ({
    id: `${medicationId}-schedule-${index}`,
    medication_id: medicationId,
    patient_id: mockPatientProfile.id,
    scheduled_time: time,
    frequency,
    weekdays: frequency === "weekly" ? normalizedWeekdays : null,
    start_date: todayKey(),
    end_date: null,
    is_active: true,
    created_at: createdAt,
    updated_at: createdAt,
  }));
}

function buildMedicationDoseEvents(
  medicationId: string,
  schedules: MedicationScheduleRecord[],
  previousEvents: DoseEventRecord[] = [],
  timestamp = new Date().toISOString(),
) {
  const events: DoseEventRecord[] = [];

  for (let daysAgo = 6; daysAgo >= 0; daysAgo -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    const dateKey = date.toISOString().slice(0, 10);

    for (const schedule of schedules) {
      if (!isScheduleDueOnDate(schedule, date)) {
        continue;
      }

      const scheduledDatetime = `${dateKey}T${schedule.scheduled_time}:00.000Z`;
      const existingEvent = previousEvents.find(
        (event) =>
          event.medication_id === medicationId &&
          event.scheduled_datetime.slice(0, 10) === dateKey &&
          event.scheduled_datetime.slice(11, 16) === schedule.scheduled_time,
      );

      if (existingEvent) {
        events.push({
          ...existingEvent,
          id: `dose-${schedule.id}-${dateKey}`,
          schedule_id: schedule.id,
          scheduled_datetime: scheduledDatetime,
          updated_at: timestamp,
        });
        continue;
      }

      const morning = Number(schedule.scheduled_time.slice(0, 2)) <= 9;
      const status = daysAgo === 0 ? (morning ? "taken" : "pending") : daysAgo === 3 ? "missed" : "taken";

      events.push({
        id: `dose-${schedule.id}-${dateKey}`,
        patient_id: schedule.patient_id,
        medication_id: medicationId,
        schedule_id: schedule.id,
        scheduled_datetime: scheduledDatetime,
        taken_datetime: status === "taken" ? scheduledDatetime : null,
        status,
        source: status === "taken" ? "app_button" : "system_check",
        created_at: timestamp,
        updated_at: timestamp,
      });
    }
  }

  return events;
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [medications, setMedications] = useState<MedicationRecord[]>(mockMedications);
  const [schedules, setSchedules] = useState<MedicationScheduleRecord[]>(mockSchedules);
  const [doseEvents, setDoseEvents] = useState<DoseEventRecord[]>(mockDoseEvents);
  const [passport] = useState<DigitalPassportRecord>(mockPassport);

  const activeMedications = useMemo(() => medications.filter((item) => item.is_active), [medications]);
  const todayDoseItems = useMemo<TodayDoseItem[]>(() => {
    const today = todayKey();
    const currentDate = new Date();
    return schedules
      .filter((schedule) => schedule.is_active && isScheduleDueOnDate(schedule, currentDate))
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
      notificationSummary: {
        enabled: schedules.filter((item) => item.is_active && isScheduleDueOnDate(item, new Date())).length,
      },
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
          color_label: input.color_label,
          is_active: true,
          created_by_user_id: mockUser.id,
          created_at: createdAt,
          updated_at: createdAt,
        };

        const newSchedules = buildMedicationSchedules(
          medicationId,
          input.scheduledTimes,
          input.frequency,
          input.weekdays,
          createdAt,
        );
        const newDoseEvents = buildMedicationDoseEvents(medicationId, newSchedules, [], createdAt);

        setMedications((current) => [...current, newMedication]);
        setSchedules((current) => [...current, ...newSchedules]);
        setDoseEvents((current) => [...current, ...newDoseEvents]);
      },
      updateMedication(medicationId, patch, scheduledTimes, frequency, weekdays) {
        const updatedAt = new Date().toISOString();

        setMedications((current) =>
          current.map((item) => (item.id === medicationId ? { ...item, ...patch, updated_at: updatedAt } : item)),
        );

        if (scheduledTimes && frequency) {
          const nextSchedules = buildMedicationSchedules(medicationId, scheduledTimes, frequency, weekdays ?? [], updatedAt);
          const previousEvents = doseEvents.filter((item) => item.medication_id === medicationId);
          const nextDoseEvents = buildMedicationDoseEvents(medicationId, nextSchedules, previousEvents, updatedAt);

          setSchedules((current) => [...current.filter((item) => item.medication_id !== medicationId), ...nextSchedules]);
          setDoseEvents((current) => [...current.filter((item) => item.medication_id !== medicationId), ...nextDoseEvents]);
        }
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
