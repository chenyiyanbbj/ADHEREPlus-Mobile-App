import { Pressable, Text, View } from "react-native";
import { MoreVertical } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

import { PillGlyph } from "@/components/medication/pill-glyph";
import { formatDoseTime } from "@/lib/dates";
import { colors } from "@/theme/colors";
import type { DoseEventRecord, MedicationRecord, MedicationScheduleRecord } from "@/types/db";

export function MedicationCard({
  item,
  onPress,
  onEdit,
}: {
  item: {
    label: string;
    medication: MedicationRecord;
    schedules: MedicationScheduleRecord[];
    todayEvents: DoseEventRecord[];
    gradientTo: string;
  };
  onPress: () => void;
  onEdit: () => void;
}) {
  const scheduleLabel = item.schedules.map((schedule) => formatDoseTime(schedule.scheduled_time)).join(" · ");
  const takenCount = item.todayEvents.filter((event) => event.status === "taken").length;
  const totalCount = item.schedules.length;
  const isActive = item.medication.is_active;

  return (
    <Pressable onPress={onPress}>
      <LinearGradient
        colors={[item.medication.color_label || colors.amber, item.gradientTo]}
        style={{ marginBottom: 12, borderRadius: 24, padding: 16 }}
      >
        <View className="flex-row items-center gap-3">
          <View
            className="h-14 w-14 items-center justify-center rounded-2xl"
            style={{ backgroundColor: "rgba(255,255,255,0.12)", borderWidth: 1, borderColor: "rgba(255,255,255,0.25)" }}
          >
            <PillGlyph
              color={item.medication.color_label || colors.amber}
              secondaryColor={item.gradientTo}
              form={item.medication.form}
              width={40}
            />
          </View>

          <View className="flex-1">
            <Text className="text-base font-bold text-white">{item.medication.medication_name}</Text>
            <Text className="mt-1 text-[13px] text-white/85">{item.medication.dosage}</Text>
            <Text className="mt-1 text-xs text-white/85">{scheduleLabel}</Text>
            <Text className="mt-2 text-xs font-medium text-white/80">
              {isActive ? `${takenCount}/${totalCount} taken today` : "Medication is inactive"}
            </Text>
          </View>

          <Pressable onPress={onEdit} className="h-8 w-8 items-center justify-center rounded-full bg-white/20">
            <MoreVertical color="#FFFFFF" size={16} />
          </Pressable>
        </View>
      </LinearGradient>
    </Pressable>
  );
}
