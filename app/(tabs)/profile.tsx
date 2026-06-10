import type { ReactNode } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { Bell, ChevronRight, Globe, Lock, LogOut, UserRound } from "lucide-react-native";

import { useAppData } from "@/store/app-data-provider";
import { useSession } from "@/store/session-provider";
import { colors } from "@/theme/colors";

function ProfileRow({
  icon,
  label,
  value,
  onPress,
  danger,
}: {
  icon: ReactNode;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable onPress={onPress} className="mb-2 flex-row items-center rounded-[22px] border border-brand-border bg-white p-4">
      <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-brand-bg">{icon}</View>
      <View className="flex-1">
        <Text style={{ color: danger ? colors.missed : colors.navy, fontSize: 15 }}>{label}</Text>
        {value ? <Text className="mt-1 text-[13px] text-brand-muted">{value}</Text> : null}
      </View>
      <ChevronRight color={colors.muted} size={18} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { currentPatient, notificationSummary } = useAppData();
  const { signOut } = useSession();

  async function handleSignOut() {
    await signOut();
    router.replace("/login");
  }

  return (
    <ScrollView className="flex-1 bg-brand-bg px-5 pt-16" contentContainerStyle={{ paddingBottom: 24 }}>
      <Text className="text-[28px] font-bold text-brand-navy">Profile & Settings</Text>

      <View className="mt-4 rounded-[24px] bg-brand-navy p-4">
        <View className="flex-row items-center gap-3">
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
            <UserRound color="#FFFFFF" size={22} />
          </View>
          <View>
            <Text className="text-xs text-white/75">Patient Code</Text>
            <Text className="text-xl font-bold tracking-wide text-white">{currentPatient.user.login_id}</Text>
            <Text className="mt-1 text-xs text-white/80">{currentPatient.profile.preferred_language.toUpperCase()}</Text>
          </View>
        </View>
      </View>

      <Text className="mb-3 mt-6 text-[11px] font-semibold tracking-[1px] text-brand-muted">PREFERENCES</Text>
      <ProfileRow icon={<Globe color={colors.navy} size={18} />} label="Language" value={currentPatient.profile.preferred_language} />
      <ProfileRow
        icon={<Bell color={colors.amber} size={18} />}
        label="Notification Settings"
        value={`${notificationSummary.enabled} active reminders`}
      />

      <Text className="mb-3 mt-5 text-[11px] font-semibold tracking-[1px] text-brand-muted">ACCOUNT</Text>
      <ProfileRow icon={<Lock color={colors.navy} size={18} />} label="Change Password" onPress={() => router.push("/settings/change-password")} />
      <ProfileRow icon={<LogOut color={colors.missed} size={18} />} label="Log Out" danger onPress={handleSignOut} />
    </ScrollView>
  );
}
