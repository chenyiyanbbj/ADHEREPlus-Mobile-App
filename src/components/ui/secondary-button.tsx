import { Pressable, Text } from "react-native";

export function SecondaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className="rounded-2xl border border-brand-border bg-white px-4 py-3">
      <Text className="text-sm font-semibold text-brand-navy">{label}</Text>
    </Pressable>
  );
}
