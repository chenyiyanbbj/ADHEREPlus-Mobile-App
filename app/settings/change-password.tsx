import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Eye, EyeOff, Lock } from "lucide-react-native";

import { PrimaryButton } from "@/components/ui/primary-button";
import { colors } from "@/theme/colors";

export default function ChangePasswordScreen() {
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const isLongEnough = newPassword.length >= 8;
  const matches = isLongEnough && confirmPassword === newPassword;
  const hasError = confirmPassword.length > 0 && confirmPassword !== newPassword;

  return (
    <View className="flex-1 bg-brand-bg px-6 pt-8">
      <View className="h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: "#F8EBD8" }}>
        <Lock color={colors.amber} size={28} />
      </View>

      <Text className="mt-6 text-[28px] font-bold text-brand-navy">Change your password</Text>
      <Text className="mt-2 text-sm text-brand-muted">Password changes are optional and available from your profile at any time.</Text>

      <View className="mt-8 gap-4">
        <View>
          <Text className="mb-2 text-sm font-medium text-brand-navy">New Password</Text>
          <View className="flex-row items-center rounded-3xl border border-brand-border bg-white px-4">
            <TextInput
              secureTextEntry={!showNew}
              value={newPassword}
              onChangeText={setNewPassword}
              className="h-14 flex-1 text-brand-navy"
              placeholder="Minimum 8 characters"
              placeholderTextColor={colors.muted}
            />
            <Pressable onPress={() => setShowNew((value) => !value)}>
              {showNew ? <EyeOff color={colors.muted} size={20} /> : <Eye color={colors.muted} size={20} />}
            </Pressable>
          </View>
        </View>

        <View>
          <Text className="mb-2 text-sm font-medium text-brand-navy">Confirm Password</Text>
          <View
            className="flex-row items-center rounded-3xl bg-white px-4"
            style={{ borderWidth: 1, borderColor: hasError ? colors.missed : matches ? colors.taken : colors.border }}
          >
            <TextInput
              secureTextEntry={!showConfirm}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              className="h-14 flex-1 text-brand-navy"
              placeholder="Re-enter password"
              placeholderTextColor={colors.muted}
            />
            <Pressable onPress={() => setShowConfirm((value) => !value)}>
              {showConfirm ? <EyeOff color={colors.muted} size={20} /> : <Eye color={colors.muted} size={20} />}
            </Pressable>
          </View>
          {hasError ? <Text className="mt-1 text-sm text-brand-missed">Passwords do not match.</Text> : null}
          {matches ? <Text className="mt-1 text-sm text-brand-taken">Passwords match.</Text> : null}
        </View>
      </View>

      <View className="mt-5 rounded-[24px] border p-4" style={{ borderColor: "#EED9BB", backgroundColor: "#FBF1E3" }}>
        <Text className="text-sm font-semibold" style={{ color: "#9A7A50" }}>Password requirements</Text>
        <Text style={{ color: isLongEnough ? colors.taken : colors.muted, marginTop: 8 }}>• At least 8 characters</Text>
      </View>

      <PrimaryButton className="mt-8" label="Save password" disabled={!matches} />
    </View>
  );
}
