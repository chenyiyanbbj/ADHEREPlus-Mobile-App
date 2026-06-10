import { ScrollView, Text, View } from "react-native";
import { router } from "expo-router";

import { MedicationCard } from "@/components/medication/medication-card";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { useAppData } from "@/store/app-data-provider";
import { groupSchedulesForList } from "@/store/selectors";

export default function MedicationsScreen() {
  const { medications, schedules, doseEvents } = useAppData();
  const groups = groupSchedulesForList(medications, schedules, doseEvents);

  return (
    <View className="flex-1 bg-brand-bg px-5 pt-16">
      <View className="mb-4 flex-row items-center justify-between">
        <View>
          <Text className="text-[28px] font-bold text-brand-navy">My Medications</Text>
          <Text className="mt-1 text-sm text-brand-muted">Manage active medications and reminder times.</Text>
        </View>
        <SecondaryButton label="Add" onPress={() => router.push("/medication/new")} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {groups.map((group) => (
          <View key={group.label} className="mb-4">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-sm font-semibold text-brand-navy">{group.label}</Text>
              <View className="rounded-full bg-brand-amber/15 px-3 py-1">
                <Text className="text-xs font-semibold text-brand-amber">{group.count} dose{group.count === 1 ? "" : "s"}</Text>
              </View>
            </View>

            {group.items.map((item) => (
              <MedicationCard
                key={item.schedule.id}
                item={item}
                onPress={() => router.push({ pathname: "/medication/[id]", params: { id: item.medication.id } })}
                onEdit={() => router.push({ pathname: "/medication/edit/[id]", params: { id: item.medication.id } })}
              />
            ))}
          </View>
        ))}

        {!groups.length ? (
          <View className="items-center rounded-[24px] border border-brand-border bg-white px-6 py-10">
            <Text className="text-base font-semibold text-brand-navy">No medications added yet</Text>
            <Text className="mt-1 text-center text-sm text-brand-muted">Tap Add or the center plus button to create your first medication.</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
