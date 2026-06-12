import { useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useLocalSearchParams, router } from "expo-router";

import { MedicationEditorFields } from "@/components/medication/medication-editor-fields";
import { PrimaryButton } from "@/components/ui/primary-button";
import { defaultScheduleTimes, isValidMedicationTime, normalizeWeekdays, weekdayOptions } from "@/lib/medications";
import { useAppData } from "@/store/app-data-provider";
import type { MedicationRecord, WeekdayCode } from "@/types/db";

export default function EditMedicationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { findMedicationById, updateMedication } = useAppData();
  const item = useMemo(() => findMedicationById(id), [findMedicationById, id]);

  const initialTimes = useMemo(
    () =>
      item?.schedules.length
        ? [...item.schedules].sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time)).map((schedule) => schedule.scheduled_time)
        : [defaultScheduleTimes[0]],
    [item],
  );

  const [name, setName] = useState(item?.medication.medication_name ?? "");
  const [dosage, setDosage] = useState(item?.medication.dosage ?? "");
  const [form, setForm] = useState<MedicationRecord["form"]>(item?.medication.form ?? "capsule");
  const [colorLabel, setColorLabel] = useState(item?.medication.color_label ?? "#9D8BD7");
  const [scheduledTimes, setScheduledTimes] = useState<string[]>(initialTimes);
  const [weekdays, setWeekdays] = useState<WeekdayCode[]>(
    item?.schedules[0]?.frequency === "weekly"
      ? normalizeWeekdays(item?.schedules[0]?.weekdays ?? [])
      : weekdayOptions.map((option) => option.value),
  );
  const [isActive, setIsActive] = useState(item?.medication.is_active ?? true);

  if (!item) {
    return (
      <View className="flex-1 items-center justify-center bg-brand-bg px-6">
        <Text className="text-base font-semibold text-brand-navy">Medication not found</Text>
      </View>
    );
  }

  const medication = item.medication;
  const canSave = Boolean(
    name.trim() &&
      dosage.trim() &&
      scheduledTimes.every((value) => isValidMedicationTime(value)) &&
      weekdays.length > 0,
  );

  function handleSave() {
    if (!canSave) {
      return;
    }

    updateMedication(
      medication.id,
      {
        medication_name: name.trim(),
        dosage: dosage.trim(),
        form,
        color_label: colorLabel,
        is_active: isActive,
      },
      scheduledTimes,
      weekdays.length === weekdayOptions.length ? "daily" : "weekly",
      weekdays,
    );
    router.back();
  }

  return (
    <ScrollView className="flex-1 bg-brand-bg px-5 pt-6" contentContainerStyle={{ paddingBottom: 24 }}>
      <Text className="text-[28px] font-bold text-brand-navy">Edit Medication</Text>
      <Text className="mt-1 text-sm text-brand-muted">Update the shape, dosage, schedule, and pill color.</Text>

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
        isActive={isActive}
        onIsActiveChange={setIsActive}
      />

      <PrimaryButton className="mt-5" label="Save changes" onPress={handleSave} disabled={!canSave} />
      <Text className="mt-3 text-sm text-brand-muted">Use 24-hour time format like `08:00`, `12:00`, or `20:00`.</Text>
    </ScrollView>
  );
}
