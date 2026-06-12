import type { MedicationRecord, MedicationScheduleRecord, WeekdayCode } from "@/types/db";

export const medicationFormOptions: Array<{ value: MedicationRecord["form"]; label: string }> = [
  { value: "capsule", label: "Capsule" },
  { value: "tablet", label: "Tablet" },
  { value: "softgel", label: "Softgel" },
];

export function medicationFormLabel(form: MedicationRecord["form"]) {
  return medicationFormOptions.find((option) => option.value === form)?.label ?? form;
}

export const medicationColorOptions = [
  "#9D8BD7",
  "#E3A16B",
  "#81C6BE",
  "#D67C73",
  "#5B7C99",
  "#D17DA8",
] as const;

export const defaultScheduleTimes = ["08:00", "12:00", "20:00"] as const;
export const maxScheduleTimes = 5;

export const weekdayOptions: Array<{ value: WeekdayCode; label: string; short: string; index: number }> = [
  { value: "sun", label: "Sunday", short: "Sun", index: 0 },
  { value: "mon", label: "Monday", short: "Mon", index: 1 },
  { value: "tue", label: "Tuesday", short: "Tue", index: 2 },
  { value: "wed", label: "Wednesday", short: "Wed", index: 3 },
  { value: "thu", label: "Thursday", short: "Thu", index: 4 },
  { value: "fri", label: "Friday", short: "Fri", index: 5 },
  { value: "sat", label: "Saturday", short: "Sat", index: 6 },
];

export const scheduleFrequencyOptions = [
  { value: "daily", label: "Every day" },
  { value: "weekly", label: "Specific weekdays" },
] as const;

const medicationBackgroundPalette: Record<string, string> = {
  "#9D8BD7": "#F1ECFB",
  "#E3A16B": "#FCF1EB",
  "#81C6BE": "#E8F7F6",
  "#D67C73": "#F8E9E6",
  "#5B7C99": "#EAF1F6",
  "#D17DA8": "#F9E8F1",
};

export function getMedicationBackground(color: string) {
  return medicationBackgroundPalette[color] ?? "#F7F3EE";
}

export function normalizeScheduledTimes(times: string[], count: number) {
  const trimmed = times.map((item) => item.trim()).filter(Boolean);
  const next = [...trimmed];

  while (next.length < count) {
    next.push(defaultScheduleTimes[next.length] ?? "08:00");
  }

  return next.slice(0, Math.min(count, maxScheduleTimes));
}

export function isValidMedicationTime(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value.trim());
}

export function buildTimeOptions(stepMinutes = 30) {
  const values: string[] = [];

  for (let hour = 0; hour < 24; hour += 1) {
    for (let minutes = 0; minutes < 60; minutes += stepMinutes) {
      values.push(`${String(hour).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`);
    }
  }

  return values;
}

export function normalizeWeekdays(weekdays: WeekdayCode[]) {
  const seen = new Set<WeekdayCode>();
  const output: WeekdayCode[] = [];

  for (const option of weekdayOptions) {
    if (weekdays.includes(option.value) && !seen.has(option.value)) {
      seen.add(option.value);
      output.push(option.value);
    }
  }

  return output;
}

export function getWeekdayCode(date: Date): WeekdayCode {
  return weekdayOptions[date.getDay()].value;
}

export function isScheduleDueOnDate(schedule: MedicationScheduleRecord, date: Date) {
  if (schedule.frequency === "daily") {
    return true;
  }

  const weekday = getWeekdayCode(date);
  return (schedule.weekdays ?? []).includes(weekday);
}
