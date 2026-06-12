import { ScrollView, Text, View } from "react-native";
import { useLocalSearchParams, router } from "expo-router";

import { PillGlyph } from "@/components/medication/pill-glyph";
import { PrimaryButton } from "@/components/ui/primary-button";
import { getMedicationBackground, medicationFormLabel, weekdayOptions } from "@/lib/medications";
import { useAppData } from "@/store/app-data-provider";
import { formatDoseTime } from "@/lib/dates";
import { gradientForColor } from "@/store/selectors";
import { colors } from "@/theme/colors";

export default function MedicationDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { findMedicationById } = useAppData();
  const item = findMedicationById(id);

  if (!item) {
    return (
      <View className="flex-1 items-center justify-center bg-brand-bg px-6">
        <Text className="text-base font-semibold text-brand-navy">Medication not found</Text>
      </View>
    );
  }

  const schedules = [...item.schedules].sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time));
  const primarySchedule = schedules[0];
  const weekdaySummary =
    primarySchedule?.frequency === "weekly"
      ? (primarySchedule.weekdays ?? [])
          .map((value) => weekdayOptions.find((option) => option.value === value)?.short ?? value)
          .join(" · ")
      : "Every day";
  const statusLabel = item.medication.is_active ? "Active" : "Inactive";
  const statusColor = item.medication.is_active ? colors.taken : colors.missed;
  const gradientTo = gradientForColor(item.medication.color_label);

  return (
    <ScrollView className="flex-1 bg-brand-bg px-5 pt-6" contentContainerStyle={{ paddingBottom: 24 }}>
      <View className="flex-row items-center">
        <View
          className="mr-4 h-[70px] w-[70px] items-center justify-center rounded-[24px]"
          style={{ backgroundColor: getMedicationBackground(item.medication.color_label), borderWidth: 1, borderColor: "#EFE6DA" }}
        >
          <PillGlyph
            color={item.medication.color_label || colors.amber}
            secondaryColor={gradientTo}
            form={item.medication.form}
            width={42}
          />
        </View>

        <View className="flex-1">
          <Text className="text-[26px] font-bold text-brand-navy">{item.medication.medication_name}</Text>
          <Text className="mt-1 text-sm text-brand-muted">{item.medication.dosage || "Dose TBD"}</Text>
          <View className="mt-3 flex-row flex-wrap gap-2">
            <View className="rounded-full border border-brand-border bg-white px-3 py-1">
              <Text className="text-xs font-semibold text-brand-navy">{medicationFormLabel(item.medication.form)}</Text>
            </View>
            <View className="rounded-full px-3 py-1" style={{ backgroundColor: item.medication.is_active ? "rgba(102,184,143,0.12)" : "rgba(214,124,115,0.12)" }}>
              <Text className="text-xs font-semibold" style={{ color: item.medication.is_active ? colors.taken : colors.missed }}>
                {statusLabel}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View className="mt-5 rounded-[24px] border border-brand-border bg-white p-5">
        <View className="gap-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-brand-muted">Schedule</Text>
            <Text className="text-sm font-semibold text-brand-navy">{weekdaySummary}</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-brand-muted">Times per day</Text>
            <Text className="text-sm font-semibold text-brand-navy">{schedules.length}</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-brand-muted">Medication type</Text>
            <Text className="text-sm font-semibold text-brand-navy">{medicationFormLabel(item.medication.form)}</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-brand-muted">Status</Text>
            <Text className="text-sm font-semibold" style={{ color: statusColor }}>
              {statusLabel}
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-brand-muted">Dose</Text>
            <Text className="text-sm font-semibold text-brand-navy">{item.medication.dosage || "Dose TBD"}</Text>
          </View>
          <View>
            <Text className="text-sm text-brand-muted">Dose times</Text>
            <View className="mt-3 flex-row flex-wrap gap-2">
              {schedules.map((schedule) => (
                <View key={schedule.id} className="rounded-full border border-brand-border bg-brand-bg px-3 py-2">
                  <Text className="text-sm font-semibold text-brand-navy">{formatDoseTime(schedule.scheduled_time)}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>

      <PrimaryButton
        className="mt-5"
        label="Edit medication"
        onPress={() => router.push({ pathname: "/medication/edit/[id]", params: { id: item.medication.id } })}
      />
    </ScrollView>
  );
}
