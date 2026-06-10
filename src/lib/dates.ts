export function formatDoseTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const value = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${String(value).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
}

export function formatFriendlyDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function isoNow() {
  return new Date().toISOString();
}

export function todayKey() {
  return new Date().toISOString().slice(0, 10);
}
