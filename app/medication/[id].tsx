import { ScrollView, Text, View } from "react-native";
import { useLocalSearchParams, router } from "expo-router";

import { PrimaryButton } from "@/components/ui/primary-button";
import { useAppData } from "@/store/app-data-provider";
import { formatDoseTime } from "@/lib/dates";

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

  return (
    <ScrollView className="flex-1 bg-brand-bg px-5 pt-6" contentContainerStyle={{ paddingBottom: 24 }}>
      <Text className="text-[28px] font-bold text-brand-navy">{item.medication.medication_name}</Text>
      <Text className="mt-1 text-sm text-brand-muted">{item.medication.dosage || "Dose TBD"}</Text>

      <View className="mt-5 rounded-[24px] border border-brand-border bg-white p-4">
        <Text className="text-sm font-semibold text-brand-muted">Daily times</Text>
        <View className="mt-3 gap-2">
          {item.schedules.map((schedule) => (
            <Text key={schedule.id} className="text-base text-brand-navy">
              {formatDoseTime(schedule.scheduled_time)}
            </Text>
          ))}
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
