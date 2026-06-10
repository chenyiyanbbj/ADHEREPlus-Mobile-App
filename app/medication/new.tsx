import { useState } from "react";
import { ScrollView, Switch, Text, TextInput, View } from "react-native";
import { router } from "expo-router";

import { PrimaryButton } from "@/components/ui/primary-button";
import { useAppData } from "@/store/app-data-provider";
import { colors } from "@/theme/colors";

export default function NewMedicationScreen() {
  const { createMedication } = useAppData();
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [timeOne, setTimeOne] = useState("08:00");
  const [timeTwoEnabled, setTimeTwoEnabled] = useState(true);
  const [timeTwo, setTimeTwo] = useState("20:00");

  function handleSave() {
    createMedication({
      medication_name: name,
      dosage,
      form: "capsule",
      scheduledTimes: timeTwoEnabled ? [timeOne, timeTwo] : [timeOne],
    });
    router.replace("/medications");
  }

  return (
    <ScrollView className="flex-1 bg-brand-bg px-5 pt-6" contentContainerStyle={{ paddingBottom: 24 }}>
      <Text className="text-[28px] font-bold text-brand-navy">Add Medication</Text>
      <Text className="mt-1 text-sm text-brand-muted">MVP supports daily schedules with one or more fixed times.</Text>

      <View className="mt-5 gap-4 rounded-[24px] border border-brand-border bg-white p-4">
        <View>
          <Text className="mb-2 text-sm font-medium text-brand-navy">Medication name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Tacrolimus"
            placeholderTextColor={colors.muted}
            className="h-12 rounded-2xl border border-brand-border px-4 text-brand-navy"
          />
        </View>

        <View>
          <Text className="mb-2 text-sm font-medium text-brand-navy">Dosage</Text>
          <TextInput
            value={dosage}
            onChangeText={setDosage}
            placeholder="2 mg"
            placeholderTextColor={colors.muted}
            className="h-12 rounded-2xl border border-brand-border px-4 text-brand-navy"
          />
        </View>

        <View>
          <Text className="mb-2 text-sm font-medium text-brand-navy">Time 1</Text>
          <TextInput value={timeOne} onChangeText={setTimeOne} className="h-12 rounded-2xl border border-brand-border px-4 text-brand-navy" />
        </View>

        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-medium text-brand-navy">Add a second daily reminder</Text>
          <Switch value={timeTwoEnabled} onValueChange={setTimeTwoEnabled} />
        </View>

        {timeTwoEnabled ? (
          <View>
            <Text className="mb-2 text-sm font-medium text-brand-navy">Time 2</Text>
            <TextInput value={timeTwo} onChangeText={setTimeTwo} className="h-12 rounded-2xl border border-brand-border px-4 text-brand-navy" />
          </View>
        ) : null}
      </View>

      <PrimaryButton className="mt-5" label="Save medication" onPress={handleSave} disabled={!name.trim() || !dosage.trim()} />
    </ScrollView>
  );
}
