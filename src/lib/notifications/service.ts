import * as Notifications from "expo-notifications";

import type { MedicationScheduleRecord } from "@/types/db";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldSetBadge: false,
  }),
});

export async function ensureNotificationPermissions() {
  const current = await Notifications.getPermissionsAsync();

  if (current.granted) {
    return current;
  }

  return Notifications.requestPermissionsAsync();
}

export async function scheduleMedicationReminder(schedule: MedicationScheduleRecord, medicationName: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Medication reminder",
      body: `Time to take ${medicationName}`,
      data: { scheduleId: schedule.id, medicationId: schedule.medication_id },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: Number(schedule.scheduled_time.slice(0, 2)),
      minute: Number(schedule.scheduled_time.slice(3, 5)),
    },
  });
}
