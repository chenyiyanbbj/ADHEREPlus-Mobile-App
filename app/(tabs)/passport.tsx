import type { ReactNode } from "react";
import { ScrollView, Text, View } from "react-native";

import { medicationFormOptions } from "@/lib/medications";
import { useAppData } from "@/store/app-data-provider";

function PassportSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="rounded-[24px] border border-brand-border bg-brand-card p-4">
      <Text className="mb-3 text-sm font-semibold uppercase tracking-[1px] text-brand-muted">{title}</Text>
      {children}
    </View>
  );
}

export default function PassportScreen() {
  const { passport, activeMedications } = useAppData();

  return (
    <ScrollView className="flex-1 bg-brand-bg px-5 pt-16" contentContainerStyle={{ paddingBottom: 24 }}>
      <Text className="text-[28px] font-bold text-brand-navy">Digital Passport</Text>
      <Text className="mt-1 text-sm text-brand-muted">Emergency transplant information and current medications.</Text>

      <View className="mt-5 gap-4">
        <PassportSection title="Organ & Transplant">
          <Text className="text-base font-semibold text-brand-navy">{passport.organ}</Text>
          <Text className="mt-1 text-sm text-brand-muted">Transplant date: {passport.transplant_date}</Text>
        </PassportSection>

        <PassportSection title="Current Medications">
          {activeMedications.map((med) => (
            <View key={med.id} className="mb-3 flex-row items-center justify-between">
              <View>
                <Text className="text-sm font-medium text-brand-navy">{med.medication_name}</Text>
                <Text className="mt-1 text-xs text-brand-muted">{med.dosage || "Dose TBD"}</Text>
              </View>
              <View className="rounded-full bg-brand-amber/15 px-3 py-1">
                <Text className="text-xs font-semibold text-brand-amber">
                  {medicationFormOptions.find((option) => option.value === med.form)?.label ?? med.form}
                </Text>
              </View>
            </View>
          ))}
        </PassportSection>

        <PassportSection title="Allergies">
          <Text className="text-sm text-brand-navy">{passport.allergies || "None recorded"}</Text>
        </PassportSection>

        <PassportSection title="Emergency Contact">
          <Text className="text-sm font-medium text-brand-navy">{passport.emergency_contact}</Text>
          <Text className="mt-2 text-sm text-brand-muted">{passport.emergency_notes}</Text>
        </PassportSection>
      </View>
    </ScrollView>
  );
}
