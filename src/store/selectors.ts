import { todayKey } from "@/lib/dates";
import type { DoseEventRecord, MedicationRecord, MedicationScheduleRecord } from "@/types/db";

export interface DayAdherenceData {
  dateKey: string;
  day: number;
  dotColor: "green" | "amber" | "red" | null;
  percentage: number; // 0-100, or -1 when no events exist for this day
  doseItems: Array<{
    medication: MedicationRecord;
    schedule: MedicationScheduleRecord;
    doseEvent: DoseEventRecord;
    gradientTo: string;
  }>;
}

const gradientPalette: Record<string, string> = {
  "#9D8BD7": "#C9BDF0",
  "#E3A16B": "#F4C9A6",
  "#81C6BE": "#C7E7E2",
  "#D67C73": "#E9B2AC",
};

export function gradientForColor(color: string) {
  return gradientPalette[color] ?? "#F2B35D";
}

export function groupSchedulesForList(
  medications: MedicationRecord[],
  schedules: MedicationScheduleRecord[],
  doseEvents: DoseEventRecord[],
) {
  const today = todayKey();
  const activeMedications = medications.filter((med) => med.is_active);
  const items = schedules
    .filter((schedule) => schedule.is_active)
    .map((schedule) => {
      const medication = activeMedications.find((med) => med.id === schedule.medication_id);
      if (!medication) {
        return null;
      }

      const doseEvent = doseEvents.find(
        (event) => event.schedule_id === schedule.id && event.scheduled_datetime.slice(0, 10) === today,
      );

      const hour = Number(schedule.scheduled_time.slice(0, 2));
      const label = hour < 10 ? "Before breakfast" : hour < 15 ? "After lunch" : hour < 21 ? "Evening with meal" : "Before sleep";

      return {
        label,
        medication,
        schedule,
        doseEvent,
        gradientTo: gradientForColor(medication.color_label),
      };
    })
    .filter(Boolean) as Array<{
    label: string;
    medication: MedicationRecord;
    schedule: MedicationScheduleRecord;
    doseEvent?: DoseEventRecord;
    gradientTo: string;
  }>;

  const map = new Map<string, typeof items>();
  for (const item of items.sort((a, b) => a.schedule.scheduled_time.localeCompare(b.schedule.scheduled_time))) {
    const group = map.get(item.label) ?? [];
    group.push(item);
    map.set(item.label, group);
  }

  return Array.from(map.entries()).map(([label, groupedItems]) => ({
    label,
    count: groupedItems.length,
    items: groupedItems,
  }));
}

/**
 * Builds per-day adherence data for every day in the given month.
 * Single source of truth used by all three calendar sections.
 */
export function buildMonthAdherenceData(
  year: number,
  month: number, // 1-12
  doseEvents: DoseEventRecord[],
  medications: MedicationRecord[],
  schedules: MedicationScheduleRecord[],
): DayAdherenceData[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const result: DayAdherenceData[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const dayEvents = doseEvents.filter((e) => e.scheduled_datetime.slice(0, 10) === dateKey);

    let dotColor: DayAdherenceData["dotColor"] = null;
    let percentage = -1;

    if (dayEvents.length > 0) {
      const taken = dayEvents.filter((e) => e.status === "taken").length;
      percentage = Math.round((taken / dayEvents.length) * 100);
      dotColor = taken === dayEvents.length ? "green" : taken === 0 ? "red" : "amber";
    }

    const doseItems = dayEvents
      .map((event) => {
        const schedule = schedules.find((s) => s.id === event.schedule_id);
        const medication = medications.find((m) => m.id === event.medication_id);
        if (!schedule || !medication) return null;
        return { medication, schedule, doseEvent: event, gradientTo: gradientForColor(medication.color_label) };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => a.schedule.scheduled_time.localeCompare(b.schedule.scheduled_time));

    result.push({ dateKey, day: d, dotColor, percentage, doseItems });
  }

  return result;
}

export function calcOverallAdherence(doseEvents: DoseEventRecord[]): number {
  const resolved = doseEvents.filter((e) => e.status !== "pending");
  if (!resolved.length) return 0;
  return Math.round((resolved.filter((e) => e.status === "taken").length / resolved.length) * 100);
}

export function buildWeeklyAdherenceSummary(doseEvents: DoseEventRecord[]) {
  const output: Array<{ date: string; label: string; percentage: number }> = [];

  for (let daysAgo = 6; daysAgo >= 0; daysAgo -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    const dateKey = date.toISOString().slice(0, 10);
    const dayEvents = doseEvents.filter((item) => item.scheduled_datetime.slice(0, 10) === dateKey && item.status !== "pending");
    const taken = dayEvents.filter((item) => item.status === "taken").length;
    const percentage = dayEvents.length ? Math.round((taken / dayEvents.length) * 100) : 0;

    output.push({
      date: dateKey,
      label: date.toLocaleDateString("en-US", { weekday: "short" }),
      percentage,
    });
  }

  return output;
}
