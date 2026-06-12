import { Pressable, ScrollView, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Check, Flame } from "lucide-react-native";
import Svg, { Circle } from "react-native-svg";

import { PillGlyph } from "@/components/medication/pill-glyph";
import { getMedicationBackground } from "@/lib/medications";
import { useAppData } from "@/store/app-data-provider";
import { colors } from "@/theme/colors";
import { formatDoseTime, formatFriendlyDate } from "@/lib/dates";

function getDoseAccent(status: "pending" | "taken" | "missed") {
  if (status === "taken") return colors.taken;
  if (status === "missed") return colors.missed;
  return colors.amber;
}

function getMedicationInstruction(name: string) {
  if (name === "Tacrolimus") return "Before eating";
  if (name === "Mycophenolate" || name === "Prednisone") return "After eating";
  return "";
}

function ProgressRing({ taken, total }: { taken: number; total: number }) {
  const size = 68;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = total > 0 ? Math.min(Math.max(taken / total, 0), 1) : 0;
  const progressColor = taken === total && total > 0 ? colors.taken : taken > 0 ? colors.amber : "#ECE3D7";

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}>
        <Circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#ECE3D7" strokeWidth={strokeWidth} />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={progressColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference * progress} ${circumference}`}
        />
      </Svg>

      <Text className="text-base font-bold text-brand-navy">
        {taken}/{total}
      </Text>
    </View>
  );
}

function calculateAdherenceStreak(doseEvents: Array<{ scheduled_datetime: string; status: "pending" | "taken" | "missed" }>) {
  const byDate = new Map<string, Array<{ status: "pending" | "taken" | "missed" }>>();

  for (const event of doseEvents) {
    const dateKey = event.scheduled_datetime.slice(0, 10);
    const current = byDate.get(dateKey) ?? [];
    current.push({ status: event.status });
    byDate.set(dateKey, current);
  }

  const sortedDates = Array.from(byDate.keys()).sort((a, b) => b.localeCompare(a));
  let streak = 0;

  for (const dateKey of sortedDates) {
    const events = byDate.get(dateKey) ?? [];
    const completed = events.length > 0 && events.every((event) => event.status === "taken");

    if (!completed) {
      if (streak === 0) {
        continue;
      }
      break;
    }

    streak += 1;
  }

  return streak;
}

export default function TodayScreen() {
  const { currentPatient, todayDoseItems, doseEvents, markDoseTaken } = useAppData();
  const total = todayDoseItems.length;
  const taken = todayDoseItems.filter((item) => item.doseEvent.status === "taken").length;
  const streak = calculateAdherenceStreak(doseEvents);
  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 17 ? "Good afternoon" : "Good evening";

  return (
    <View className="flex-1 bg-brand-bg">
      <LinearGradient colors={[colors.navy, "#89A6BD"]} style={{ paddingTop: 72, paddingBottom: 28, paddingHorizontal: 20 }}>
        <View style={{ position: "absolute", right: 12, top: 10, opacity: 0.22, transform: [{ rotate: "-18deg" }] }}>
          <PillGlyph color="#D7E7F3" width={132} />
        </View>

        <View>
          <View className="pr-4">
            <Text className="text-[13px] text-white/80">{formatFriendlyDate(new Date())}</Text>
            <Text className="mt-1 text-[22px] font-bold text-white">
              {greeting}, {currentPatient.user.login_id}!
            </Text>
            <Text className="mt-1 text-sm text-white/85">Let&apos;s check your schedule</Text>
          </View>
        </View>
      </LinearGradient>

      <View className="px-5" style={{ marginTop: -18 }}>
        <View
          className="rounded-[28px] border border-brand-border bg-white px-5 py-5"
          style={{
            shadowColor: colors.navy,
            shadowOpacity: 0.08,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 10 },
          }}
        >
          <View className="flex-row items-center">
            <ProgressRing taken={taken} total={total} />

            <View className="ml-5 flex-1 pr-5">
              <Text className="text-[18px] font-bold text-brand-navy">
                {total === 0 ? "No medications today" : `${taken} of ${total} taken`}
              </Text>
              <Text className="mt-1 text-sm text-brand-muted">Today&apos;s medications</Text>
              <View className="mt-4 flex-row items-center">
                <View className="mr-2 h-5 w-5 items-center justify-center rounded-full border border-[#D8E3D5] bg-[#F7FBF6]">
                  <Check color={colors.taken} size={12} strokeWidth={2.6} />
                </View>
                <Text className="text-[12px] font-medium text-brand-muted">Keep going! You&apos;re doing great.</Text>
              </View>
            </View>

            <View className="h-[92px] w-px bg-[#E9E1D6]" />

            <View className="ml-5 items-center justify-center">
              <Flame color={colors.amber} fill={colors.amber} size={22} strokeWidth={1.8} />
              <Text className="mt-2 text-[34px] font-bold leading-none text-brand-navy">{streak}</Text>
              <Text className="mt-1 text-[13px] font-semibold text-brand-muted">Day Streak</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-5 pt-5" contentContainerStyle={{ paddingBottom: 24 }}>
        {todayDoseItems.map((item) => {
          const accent = getDoseAccent(item.doseEvent.status);
          const instruction = getMedicationInstruction(item.medication.medication_name);

          return (
            <View
              key={item.doseEvent.id}
              style={{
                marginBottom: 14,
                borderRadius: 28,
                backgroundColor: colors.card,
                shadowColor: colors.navy,
                shadowOpacity: 0.1,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 4 },
                overflow: "hidden",
              }}
            >
              <View style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 6, backgroundColor: accent }} />

              <View className="h-[132px] flex-row items-center px-6">
                <View
                  className="mr-4 h-[70px] w-[70px] items-center justify-center rounded-[24px]"
                  style={{ backgroundColor: getMedicationBackground(item.medication.color_label || ""), borderWidth: 1, borderColor: "#EFE6DA" }}
                >
                  <PillGlyph
                    color={item.medication.color_label || colors.amber}
                    secondaryColor={item.gradientTo}
                    form={item.medication.form}
                    width={42}
                  />
                </View>

                <View className="flex-1 pr-4">
                  <Text className="text-[20px] font-bold text-brand-navy">{item.medication.medication_name}</Text>
                  <Text className="mt-2 text-[14px] leading-6 text-brand-muted">
                    {item.medication.dosage || "Dose TBD"} · {formatDoseTime(item.schedule.scheduled_time)}
                    {instruction ? ` · ${instruction}` : ""}
                  </Text>
                </View>

                {item.doseEvent.status === "taken" ? (
                  <View
                    className="h-[48px] w-[48px] items-center justify-center rounded-[18px]"
                    style={{
                      backgroundColor: "#F1F8F3",
                      borderWidth: 1,
                      borderColor: "#D4E7DA",
                    }}
                  >
                    <Check color={colors.taken} size={24} strokeWidth={2.6} />
                  </View>
                ) : (
                  <Pressable
                    onPress={() => markDoseTaken(item.doseEvent.id)}
                    className="h-[48px] w-[96px] items-center justify-center rounded-full"
                    style={{
                      backgroundColor: colors.amber,
                      shadowColor: colors.amber,
                      shadowOpacity: 0.18,
                      shadowRadius: 8,
                      shadowOffset: { width: 0, height: 3 },
                    }}
                  >
                    <Text className="text-[15px] font-bold text-white">Take</Text>
                  </Pressable>
                )}
              </View>
            </View>
          );
        })}

        {todayDoseItems.length === 0 ? (
          <View className="items-center rounded-[24px] border border-brand-border bg-white px-6 py-10">
            <PillGlyph color={colors.amber} form="capsule" width={56} />
            <Text className="mt-4 text-base font-semibold text-brand-navy">No medications scheduled</Text>
            <Text className="mt-1 text-center text-sm text-brand-muted">Use the center plus button to add your first medication.</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
