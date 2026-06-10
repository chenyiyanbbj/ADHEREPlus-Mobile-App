import { useMemo, useState } from "react";
import { ScrollView, Switch, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, router } from "expo-router";

import { PrimaryButton } from "@/components/ui/primary-button";
import { useAppData } from "@/store/app-data-provider";
import { colors } from "@/theme/colors";

export default function EditMedicationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { findMedicationById, updateMedication } = useAppData();
  const item = useMemo(() => findMedicationById(id), [findMedicationById, id]);

  const [name, setName] = useState(item?.medication.medication_name ?? "");
  const [dosage, setDosage] = useState(item?.medication.dosage ?? "");
  const [isActive, setIsActive] = useState(item?.medication.is_active ?? true);

  if (!item) {
    return (
      <View className="flex-1 items-center justify-center bg-brand-bg px-6">
        <Text className="text-base font-semibold text-brand-navy">Medication not found</Text>
      </View>
    );
  }

  const medication = item.medication;

  function handleSave() {
    updateMedication(medication.id, {
      medication_name: name,
      dosage,
      is_active: isActive,
    });
    router.back();
  }

  return (
    <ScrollView className="flex-1 bg-brand-bg px-5 pt-6" contentContainerStyle={{ paddingBottom: 24 }}>
      <Text className="text-[28px] font-bold text-brand-navy">Edit Medication</Text>

      <View className="mt-5 gap-4 rounded-[24px] border border-brand-border bg-white p-4">
        <View>
          <Text className="mb-2 text-sm font-medium text-brand-navy">Medication name</Text>
          <TextInput value={name} onChangeText={setName} className="h-12 rounded-2xl border border-brand-border px-4 text-brand-navy" />
        </View>
        <View>
          <Text className="mb-2 text-sm font-medium text-brand-navy">Dosage</Text>
          <TextInput value={dosage} onChangeText={setDosage} className="h-12 rounded-2xl border border-brand-border px-4 text-brand-navy" />
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-medium text-brand-navy">Active medication</Text>
          <Switch value={isActive} onValueChange={setIsActive} />
        </View>
      </View>

      <PrimaryButton className="mt-5" label="Save changes" onPress={handleSave} disabled={!name.trim() || !dosage.trim()} />
      <Text className="mt-3 text-sm text-brand-muted">If you forgot your password, ask your doctor to reset it.</Text>
    </ScrollView>
  );
}
