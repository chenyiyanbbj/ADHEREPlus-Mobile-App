import { useMemo, useState } from "react";
import { ScrollView, Text } from "react-native";
import { router } from "expo-router";

import { MedicationEditorFields } from "@/components/medication/medication-editor-fields";
import { PrimaryButton } from "@/components/ui/primary-button";
import { defaultScheduleTimes, isValidMedicationTime, weekdayOptions } from "@/lib/medications";
import { useAppData } from "@/store/app-data-provider";
import type { MedicationRecord, WeekdayCode } from "@/types/db";

export default function NewMedicationScreen() {
  const { createMedication } = useAppData();
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [form, setForm] = useState<MedicationRecord["form"]>("capsule");
  const [colorLabel, setColorLabel] = useState("#9D8BD7");
  const [scheduledTimes, setScheduledTimes] = useState<string[]>([defaultScheduleTimes[0], defaultScheduleTimes[2]]);
  const [weekdays, setWeekdays] = useState<WeekdayCode[]>(weekdayOptions.map((option) => option.value));

  const canSave = useMemo(
    () =>
      Boolean(
        name.trim() &&
          dosage.trim() &&
          scheduledTimes.every((item) => isValidMedicationTime(item)) &&
          weekdays.length > 0,
      ),
    [dosage, name, scheduledTimes, weekdays.length],
  );

  function handleSave() {
    if (!canSave) {
      return;
    }

    createMedication({
      medication_name: name.trim(),
      dosage: dosage.trim(),
      form,
      color_label: colorLabel,
      frequency: weekdays.length === weekdayOptions.length ? "daily" : "weekly",
      weekdays,
      scheduledTimes,
    });
    router.replace("/medications");
  }

  return (
    <ScrollView className="flex-1 bg-brand-bg px-5 pt-6" contentContainerStyle={{ paddingBottom: 24 }}>
      <Text className="text-[28px] font-bold text-brand-navy">Add Medication</Text>
      <Text className="mt-1 text-sm text-brand-muted">Set the medication type, dose, daily schedule, and pill color.</Text>

      <MedicationEditorFields
        name={name}
        dosage={dosage}
        form={form}
        colorLabel={colorLabel}
        weekdays={weekdays}
        scheduledTimes={scheduledTimes}
        onNameChange={setName}
        onDosageChange={setDosage}
        onFormChange={setForm}
        onColorChange={setColorLabel}
        onWeekdaysChange={setWeekdays}
        onScheduledTimesChange={setScheduledTimes}
      />

      <PrimaryButton className="mt-5" label="Save medication" onPress={handleSave} disabled={!canSave} />
      <Text className="mt-3 text-sm text-brand-muted">Use 24-hour time format like `08:00`, `12:00`, or `20:00`.</Text>
    </ScrollView>
  );
}
