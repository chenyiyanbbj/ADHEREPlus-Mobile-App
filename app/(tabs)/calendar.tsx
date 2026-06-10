import { ScrollView, Text, View } from "react-native";

import { useAppData } from "@/store/app-data-provider";
import { buildWeeklyAdherenceSummary } from "@/store/selectors";
import { colors } from "@/theme/colors";

export default function CalendarScreen() {
  const { doseEvents } = useAppData();
  const week = buildWeeklyAdherenceSummary(doseEvents);

  return (
    <ScrollView className="flex-1 bg-brand-bg px-5 pt-16" contentContainerStyle={{ paddingBottom: 24 }}>
      <Text className="text-[28px] font-bold text-brand-navy">Calendar & History</Text>
      <Text className="mt-1 text-sm text-brand-muted">This week&apos;s adherence summary based on dose events.</Text>

      <View className="mt-5 rounded-[24px] border border-brand-border bg-white p-4">
        <Text className="text-base font-semibold text-brand-navy">Weekly adherence</Text>
        <View className="mt-4 gap-3">
          {week.map((item) => (
            <View key={item.date} className="flex-row items-center">
              <View className="w-20">
                <Text className="text-sm text-brand-navy">{item.label}</Text>
              </View>
              <View className="mx-3 h-3 flex-1 overflow-hidden rounded-full bg-brand-border">
                <View
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: item.percentage >= 80 ? colors.taken : colors.amber,
                    height: "100%",
                  }}
                />
              </View>
              <Text className="w-14 text-right text-sm font-medium text-brand-navy">{item.percentage}%</Text>
            </View>
          ))}
        </View>
      </View>

      <View className="mt-4 rounded-[24px] border border-brand-border bg-white p-4">
        <Text className="text-base font-semibold text-brand-navy">Dose event status</Text>
        <View className="mt-4 gap-3">
          {doseEvents.slice(0, 10).map((event) => (
            <View key={event.id} className="flex-row items-center justify-between border-b border-brand-border pb-3">
              <View>
                <Text className="text-sm font-medium text-brand-navy">{event.scheduled_datetime.slice(0, 10)}</Text>
                <Text className="mt-1 text-xs text-brand-muted">{event.scheduled_datetime.slice(11, 16)}</Text>
              </View>
              <Text
                style={{
                  color: event.status === "taken" ? colors.taken : event.status === "missed" ? colors.missed : colors.muted,
                  fontWeight: "600",
                }}
              >
                {event.status}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
