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
    medication: MedicationRecord;
    schedule: MedicationScheduleRecord;
    doseEvent?: DoseEventRecord;
    gradientTo: string;
  };
  onPress: () => void;
  onEdit: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <LinearGradient
        colors={[item.medication.color_label || colors.amber, item.gradientTo]}
        style={{ marginBottom: 12, borderRadius: 24, padding: 16 }}
      >
        <View className="flex-row items-center gap-3">
          <View className="h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
            <PillGlyph color="#FFFFFF" width={42} />
          </View>

          <View className="flex-1">
            <Text className="text-base font-bold text-white">{item.medication.medication_name}</Text>
            <Text className="mt-1 text-[13px] text-white/85">
              {item.medication.dosage} · {formatDoseTime(item.schedule.scheduled_time)}
            </Text>
            {item.doseEvent ? <Text className="mt-1 text-xs text-white/80">{item.doseEvent.status}</Text> : null}
          </View>

          <Pressable onPress={onEdit} className="h-8 w-8 items-center justify-center rounded-full bg-white/20">
            <MoreVertical color="#FFFFFF" size={16} />
          </Pressable>
        </View>
      </LinearGradient>
    </Pressable>
  );
}
