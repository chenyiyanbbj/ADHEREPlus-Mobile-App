import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { colors } from "@/theme/colors";

export function PrimaryButton({
  label,
  onPress,
  disabled,
  compact,
  icon,
  className,
}: {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  compact?: boolean;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <Pressable disabled={disabled} onPress={onPress} className={className}>
      <LinearGradient
        colors={[colors.navy, "#7898B2"]}
        style={{
          minHeight: compact ? 36 : 52,
          borderRadius: compact ? 14 : 22,
          paddingHorizontal: compact ? 14 : 18,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: 6,
          opacity: disabled ? 0.45 : 1,
        }}
      >
        {icon ? <View>{icon}</View> : null}
        <Text className="text-sm font-semibold text-white">{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}
