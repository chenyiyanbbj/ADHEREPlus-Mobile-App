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
  "#5B7C99": "#A9C0D2",
  "#D17DA8": "#EAB4CD",
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
  const items = medications.map((medication) => {
    const medicationSchedules = schedules
      .filter((schedule) => schedule.medication_id === medication.id)
      .sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time));

    if (!medicationSchedules.length) {
      return null;
    }

    const todayEvents = medicationSchedules
      .map((schedule) =>
        doseEvents.find((event) => event.schedule_id === schedule.id && event.scheduled_datetime.slice(0, 10) === today),
      )
      .filter(Boolean) as DoseEventRecord[];

    return {
      label: medication.is_active ? "Active" : "Inactive",
      medication,
      schedules: medicationSchedules,
      todayEvents,
      gradientTo: gradientForColor(medication.color_label),
    };
  }).filter(Boolean) as Array<{
    label: string;
    medication: MedicationRecord;
    schedules: MedicationScheduleRecord[];
    todayEvents: DoseEventRecord[];
    gradientTo: string;
  }>;

  const map = new Map<string, typeof items>();
  for (const item of items.sort((a, b) => a.medication.medication_name.localeCompare(b.medication.medication_name))) {
    const group = map.get(item.label) ?? [];
    group.push(item);
    map.set(item.label, group);
  }

  return ["Active", "Inactive"]
    .map((label) => {
      const groupedItems = map.get(label) ?? [];
      return {
        label,
        count: groupedItems.length,
        items: groupedItems,
      };
    })
    .filter((group) => group.count > 0);
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
