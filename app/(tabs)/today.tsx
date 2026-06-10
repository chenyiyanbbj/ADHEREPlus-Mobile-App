import { Pressable, ScrollView, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Check } from "lucide-react-native";

import { PillGlyph } from "@/components/medication/pill-glyph";
import { useAppData } from "@/store/app-data-provider";
import { colors } from "@/theme/colors";
import { formatDoseTime, formatFriendlyDate } from "@/lib/dates";

function getDoseAccent(status: "pending" | "taken" | "missed") {
  if (status === "taken") return colors.taken;
  if (status === "missed") return colors.missed;
  return colors.amber;
}

function getPillBackground(color: string) {
  if (color === "#9D8BD7") return "#F1ECFB";
  if (color === "#E3A16B") return "#FCF1EB";
  if (color === "#81C6BE") return "#E8F7F6";
  return "#F7F3EE";
}

function getMedicationInstruction(name: string) {
  if (name === "Tacrolimus") return "Before eating";
  if (name === "Mycophenolate" || name === "Prednisone") return "After eating";
  return "";
}

export default function TodayScreen() {
  const { currentPatient, todayDoseItems, markDoseTaken } = useAppData();
  const total = todayDoseItems.length;
  const taken = todayDoseItems.filter((item) => item.doseEvent.status === "taken").length;
  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 17 ? "Good afternoon" : "Good evening";

  return (
    <View className="flex-1 bg-brand-bg">
      <LinearGradient colors={[colors.navy, "#89A6BD"]} style={{ paddingTop: 72, paddingBottom: 28, paddingHorizontal: 20 }}>
        <View style={{ position: "absolute", right: -16, top: 18, opacity: 0.18 }}>
          <PillGlyph color="#FFFFFF" width={110} />
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
          className="rounded-[24px] border border-brand-border bg-white p-4"
          style={{
            shadowColor: colors.navy,
            shadowOpacity: 0.08,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 8 },
          }}
        >
          <View className="flex-row items-center gap-4">
            <View
              style={{
                width: 68,
                height: 68,
                borderRadius: 999,
                borderWidth: 8,
                borderColor: taken === total && total > 0 ? colors.taken : taken > 0 ? colors.amber : "#ECE3D7",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text className="text-base font-bold text-brand-navy">
                {taken}/{total}
              </Text>
            </View>

            <View className="flex-1">
              <Text className="text-[17px] font-bold text-brand-navy">
                {total === 0 ? "No medications today" : `${taken} of ${total} taken`}
              </Text>
              <Text className="mt-1 text-sm text-brand-muted">Today&apos;s medications</Text>
              {taken === total && total > 0 ? <Text className="mt-1 text-sm font-medium text-brand-taken">All done for today.</Text> : null}
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
                  style={{ backgroundColor: getPillBackground(item.medication.color_label || "") }}
                >
                  <LinearGradient
                    colors={[item.gradientTo, item.medication.color_label || colors.amber]}
                    start={{ x: 0, y: 1 }}
                    end={{ x: 1, y: 0 }}
                    style={{ borderRadius: 999, paddingHorizontal: 2, paddingVertical: 2 }}
                  >
                    <PillGlyph color="#FFFFFF" width={42} />
                  </LinearGradient>
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
            <PillGlyph color={colors.amber} width={56} />
            <Text className="mt-4 text-base font-semibold text-brand-navy">No medications scheduled</Text>
            <Text className="mt-1 text-center text-sm text-brand-muted">Use the center plus button to add your first medication.</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
