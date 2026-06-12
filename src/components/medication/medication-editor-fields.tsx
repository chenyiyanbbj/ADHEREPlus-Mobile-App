import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";
import { ChevronDown, Minus, Plus } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

import { PillGlyph } from "@/components/medication/pill-glyph";
import {
  buildTimeOptions,
  defaultScheduleTimes,
  getMedicationBackground,
  maxScheduleTimes,
  medicationColorOptions,
  medicationFormOptions,
  normalizeScheduledTimes,
  normalizeWeekdays,
  weekdayOptions,
} from "@/lib/medications";
import { gradientForColor } from "@/store/selectors";
import { colors } from "@/theme/colors";
import type { MedicationRecord, WeekdayCode } from "@/types/db";

interface MedicationEditorFieldsProps {
  name: string;
  dosage: string;
  form: MedicationRecord["form"];
  colorLabel: string;
  weekdays: WeekdayCode[];
  scheduledTimes: string[];
  onNameChange: (value: string) => void;
  onDosageChange: (value: string) => void;
  onFormChange: (value: MedicationRecord["form"]) => void;
  onColorChange: (value: string) => void;
  onWeekdaysChange: (value: WeekdayCode[]) => void;
  onScheduledTimesChange: (value: string[]) => void;
  isActive?: boolean;
  onIsActiveChange?: (value: boolean) => void;
}

const timeOptions = buildTimeOptions(5);

export function MedicationEditorFields({
  name,
  dosage,
  form,
  colorLabel,
  weekdays,
  scheduledTimes,
  onNameChange,
  onDosageChange,
  onFormChange,
  onColorChange,
  onWeekdaysChange,
  onScheduledTimesChange,
  isActive,
  onIsActiveChange,
}: MedicationEditorFieldsProps) {
  const doseCount = Math.max(1, Math.min(maxScheduleTimes, scheduledTimes.length || 1));
  const formLabel = medicationFormOptions.find((option) => option.value === form)?.label ?? form;
  const normalizedTimes = normalizeScheduledTimes(scheduledTimes, doseCount);
  const normalizedWeekdays = normalizeWeekdays(weekdays);
  const allWeekdays = weekdayOptions.map((option) => option.value);
  const isEveryday = normalizedWeekdays.length === allWeekdays.length;
  const gradientTo = gradientForColor(colorLabel);
  const [activeTimeIndex, setActiveTimeIndex] = useState(0);
  const [openTimeIndex, setOpenTimeIndex] = useState<number | null>(null);

  useEffect(() => {
    setActiveTimeIndex((current) => Math.min(current, doseCount - 1));
  }, [doseCount]);

  const weekdaySummary = useMemo(() => {
    if (isEveryday) {
      return "Taken every day";
    }

    if (!normalizedWeekdays.length) {
      return "Select one or more weekdays";
    }

    return normalizedWeekdays
      .map((value) => weekdayOptions.find((option) => option.value === value)?.short ?? value)
      .join(" · ");
  }, [isEveryday, normalizedWeekdays]);

  function updateDoseCount(nextCount: number) {
    const safeCount = Math.max(1, Math.min(maxScheduleTimes, nextCount));
    onScheduledTimesChange(normalizeScheduledTimes(normalizedTimes, safeCount));
    setActiveTimeIndex((current) => Math.min(current, safeCount - 1));
    setOpenTimeIndex((current) => (current === null ? null : Math.min(current, safeCount - 1)));
  }

  function toggleWeekday(value: WeekdayCode) {
    if (isEveryday) {
      onWeekdaysChange(allWeekdays.filter((item) => item !== value));
      return;
    }

    if (normalizedWeekdays.includes(value)) {
      onWeekdaysChange(normalizedWeekdays.filter((item) => item !== value));
      return;
    }

    onWeekdaysChange(normalizeWeekdays([...normalizedWeekdays, value]));
  }

  return (
    <View className="mt-5 gap-4 rounded-[24px] border border-brand-border bg-white p-4">
      <View className="items-center rounded-[22px] border border-brand-border bg-brand-bg px-4 py-5">
        <View
          className="h-[70px] w-[70px] items-center justify-center rounded-[24px]"
          style={{ backgroundColor: getMedicationBackground(colorLabel), borderWidth: 1, borderColor: "#EFE6DA" }}
        >
          <PillGlyph color={colorLabel} secondaryColor={gradientTo} form={form} width={42} />
        </View>
        <Text className="mt-3 text-base font-bold text-brand-navy">{name.trim() || "Medication preview"}</Text>
        <Text className="mt-1 text-sm text-brand-muted">{dosage.trim() || "Enter dosage"} · {formLabel}</Text>
      </View>

      <View>
        <Text className="mb-2 text-sm font-medium text-brand-navy">Medication name</Text>
        <TextInput
          value={name}
          onChangeText={onNameChange}
          placeholder="Tacrolimus"
          placeholderTextColor={colors.muted}
          className="h-12 rounded-2xl border border-brand-border px-4 text-brand-navy"
        />
      </View>

      <View>
        <Text className="mb-2 text-sm font-medium text-brand-navy">Dosage</Text>
        <TextInput
          value={dosage}
          onChangeText={onDosageChange}
          placeholder="2 mg"
          placeholderTextColor={colors.muted}
          className="h-12 rounded-2xl border border-brand-border px-4 text-brand-navy"
        />
      </View>

      <View>
        <Text className="mb-2 text-sm font-medium text-brand-navy">Medication type</Text>
        <View className="flex-row gap-2">
          {medicationFormOptions.map((option) => {
            const selected = option.value === form;

            return (
              <Pressable
                key={option.value}
                onPress={() => onFormChange(option.value)}
                className="flex-1 rounded-2xl px-3 py-3"
                style={{
                  backgroundColor: selected ? "#EEF4F8" : colors.bg,
                  borderWidth: 1,
                  borderColor: selected ? colors.navy : colors.border,
                }}
              >
                <View className="items-center">
                  <PillGlyph color={colorLabel} secondaryColor={gradientTo} form={option.value} width={32} />
                  <Text className="mt-2 text-sm font-semibold" style={{ color: colors.navy, opacity: selected ? 1 : 0.88 }}>
                    {option.label}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View>
        <Text className="mb-2 text-sm font-medium text-brand-navy">Dose count</Text>
        <View
          className="flex-row items-center rounded-full px-3 py-3"
          style={{ backgroundColor: "#FFFDF9", borderWidth: 1, borderColor: colors.border }}
        >
          <Pressable
            onPress={() => updateDoseCount(doseCount - 1)}
            className="h-11 w-11 items-center justify-center rounded-full"
            style={{ opacity: doseCount === 1 ? 0.55 : 1, overflow: "hidden" }}
          >
            <LinearGradient
              colors={[colors.navy, "#7898B2"]}
              style={{ flex: 1, width: "100%", alignItems: "center", justifyContent: "center", borderRadius: 999 }}
            >
              <Minus color="#FFFFFF" size={18} strokeWidth={2.6} />
            </LinearGradient>
          </Pressable>
          <View className="flex-1 items-center">
            <Text className="text-[28px] font-bold text-brand-navy">{doseCount}</Text>
            <Text className="mt-1 text-xs text-brand-muted">times each day</Text>
          </View>
          <Pressable
            onPress={() => updateDoseCount(doseCount + 1)}
            className="h-11 w-11 items-center justify-center rounded-full"
            style={{ opacity: doseCount === maxScheduleTimes ? 0.55 : 1, overflow: "hidden" }}
          >
            <LinearGradient
              colors={[colors.navy, "#7898B2"]}
              style={{ flex: 1, width: "100%", alignItems: "center", justifyContent: "center", borderRadius: 999 }}
            >
              <Plus color="#FFFFFF" size={18} strokeWidth={2.6} />
            </LinearGradient>
          </Pressable>
        </View>
      </View>

      <View>
        <Text className="mb-2 text-sm font-medium text-brand-navy">Schedule</Text>
        <View className="flex-row flex-wrap gap-2">
          <Pressable
            onPress={() => onWeekdaysChange(isEveryday ? [] : allWeekdays)}
            className="rounded-full px-4 py-2"
            style={{
              backgroundColor: isEveryday ? "#EEF4F8" : "#FFFDF9",
              borderWidth: 1,
              borderColor: isEveryday ? colors.navy : colors.border,
            }}
          >
            <Text className="text-sm font-semibold" style={{ color: colors.navy, opacity: isEveryday ? 1 : 0.88 }}>
              Everyday
            </Text>
          </Pressable>
          {weekdayOptions.map((option) => {
            const selected = isEveryday || normalizedWeekdays.includes(option.value);

            return (
              <Pressable
                key={option.value}
                onPress={() => toggleWeekday(option.value)}
                className="rounded-full px-4 py-2"
                style={{
                  backgroundColor: selected ? "#EEF4F8" : "#FFFDF9",
                  borderWidth: 1,
                  borderColor: selected ? colors.navy : colors.border,
                }}
              >
                <Text className="text-sm font-semibold" style={{ color: colors.navy, opacity: selected ? 1 : 0.88 }}>
                  {option.short}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text className="text-xs text-brand-muted">{weekdaySummary}</Text>
      </View>

      <View className="gap-3">
        {normalizedTimes.map((time, index) => {
          const isOpen = openTimeIndex === index;

          return (
            <View key={`${index}-${defaultScheduleTimes[index] ?? "default"}`}>
              <Text className="mb-2 text-sm font-medium text-brand-navy">Time {index + 1}</Text>
              <Pressable
                onPress={() => {
                  setActiveTimeIndex(index);
                  setOpenTimeIndex((current) => (current === index ? null : index));
                }}
                className="h-12 flex-row items-center justify-between rounded-2xl border border-brand-border px-4"
                style={{ backgroundColor: "#FFFFFF" }}
              >
                <Text className="text-base text-brand-navy">{time}</Text>
                <ChevronDown color={colors.navy} size={18} />
              </Pressable>

              {isOpen ? (
                <View
                  className="mt-3 rounded-[18px] border border-brand-border bg-white"
                  style={{ maxHeight: 220, overflow: "hidden" }}
                >
                  <ScrollView nestedScrollEnabled>
                    {timeOptions.map((option) => {
                      const selected = option === normalizedTimes[index];

                      return (
                        <Pressable
                          key={option}
                          onPress={() => {
                            const next = [...normalizedTimes];
                            next[index] = option;
                            onScheduledTimesChange(next);
                            setOpenTimeIndex(null);
                          }}
                          className="px-4 py-3"
                          style={{ backgroundColor: selected ? "#EEF4F8" : "#FFFFFF" }}
                        >
                          <Text className="text-sm font-medium" style={{ color: selected ? colors.navy : "#425466" }}>
                            {option}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>
              ) : null}
            </View>
          );
        })}
      </View>

      <View>
        <Text className="mb-2 text-sm font-medium text-brand-navy">Pill color</Text>
        <View className="flex-row flex-wrap gap-3">
          {medicationColorOptions.map((option) => {
            const selected = option === colorLabel;

            return (
              <Pressable
                key={option}
                onPress={() => onColorChange(option)}
                className="h-12 w-12 items-center justify-center rounded-full"
                style={{
                  backgroundColor: selected ? "#FFFDF9" : "transparent",
                  borderWidth: selected ? 2 : 1,
                  borderColor: selected ? colors.navy : colors.border,
                }}
              >
                <View className="h-8 w-8 rounded-full" style={{ backgroundColor: option }} />
              </Pressable>
            );
          })}
        </View>
      </View>

      {typeof isActive === "boolean" && onIsActiveChange ? (
        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-medium text-brand-navy">Active medication</Text>
          <Switch value={isActive} onValueChange={onIsActiveChange} />
        </View>
      ) : null}
    </View>
  );
}
