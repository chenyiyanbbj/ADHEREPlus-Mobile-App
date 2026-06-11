import { useState } from "react";
import { Pressable, ScrollView, Text, useWindowDimensions, View } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Line as SvgLine, Path, Text as SvgText } from "react-native-svg";

import { PillGlyph } from "@/components/medication/pill-glyph";
import { useAppData } from "@/store/app-data-provider";
import { buildMonthAdherenceData, calcOverallAdherence } from "@/store/selectors";
import type { DayAdherenceData } from "@/store/selectors";
import { colors } from "@/theme/colors";
import { formatDoseTime, todayKey } from "@/lib/dates";

// ─── constants ────────────────────────────────────────────────────────────────

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DOT_COLOR_MAP = {
  green: colors.taken,
  amber: colors.amber,
  red: colors.missed,
} as const;

const LEGEND_ITEMS: Array<{ key: "green" | "amber" | "red"; label: string }> = [
  { key: "green", label: "All taken" },
  { key: "amber", label: "Partial" },
  { key: "red", label: "Missed" },
];

function getPillBg(color: string) {
  if (color === "#9D8BD7") return "#F1ECFB";
  if (color === "#E3A16B") return "#FCF1EB";
  if (color === "#81C6BE") return "#E8F7F6";
  return "#F7F3EE";
}

// ─── MonthCalendar ─────────────────────────────────────────────────────────────

function MonthCalendar({
  year,
  month,
  days,
  selectedDate,
  onSelectDate,
}: {
  year: number;
  month: number;
  days: DayAdherenceData[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}) {
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
  const offset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const cells: (DayAdherenceData | null)[] = [...Array<null>(offset).fill(null), ...days];
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (DayAdherenceData | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const today = todayKey();

  return (
    <View>
      {/* Weekday headers */}
      <View style={{ flexDirection: "row", marginBottom: 6 }}>
        {WEEK_DAYS.map((d) => (
          <View key={d} style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ fontSize: 11, fontWeight: "600", color: colors.muted }}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Date grid */}
      {weeks.map((week, wi) => (
        <View key={wi} style={{ flexDirection: "row" }}>
          {week.map((cell, ci) => {
            if (!cell) {
              return <View key={ci} style={{ flex: 1 }} />;
            }
            const isSelected = cell.dateKey === selectedDate;
            const isToday = cell.dateKey === today;
            return (
              <Pressable
                key={cell.dateKey}
                onPress={() => onSelectDate(cell.dateKey)}
                style={{ flex: 1, alignItems: "center", paddingVertical: 4 }}
              >
                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 17,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: isSelected
                      ? colors.navy
                      : isToday
                        ? `${colors.navy}20`
                        : "transparent",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: isSelected || isToday ? "700" : "400",
                      color: isSelected ? "#FFFFFF" : colors.navy,
                    }}
                  >
                    {cell.day}
                  </Text>
                </View>
                {/* Dot — always reserve space so rows stay the same height */}
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    marginTop: 2,
                    backgroundColor: cell.dotColor ? DOT_COLOR_MAP[cell.dotColor] : "transparent",
                  }}
                />
              </Pressable>
            );
          })}
        </View>
      ))}

      {/* Legend */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 14, marginTop: 12 }}>
        {LEGEND_ITEMS.map(({ key, label }) => (
          <View key={key} style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: DOT_COLOR_MAP[key] }} />
            <Text style={{ fontSize: 11, color: colors.muted }}>{label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── LineChart ─────────────────────────────────────────────────────────────────

// Y-axis labels use native RN Text (not SvgText) so font metrics are consistent
// and the "number" + "%" always render as a single uniform string.
const Y_LABEL_W = 36; // width of the native label column to the left of the SVG
const DOT_R = 4;
const CHART_LEFT = DOT_R + 1; // keeps the first dot on the Y-axis without clipping
const CHART_PAD_R = 10;
const CHART_PAD_T = 10;
const CHART_PAD_B = 26;
const CHART_SVG_H = 168;
const CHART_INNER_H = CHART_SVG_H - CHART_PAD_T - CHART_PAD_B;

function yForPct(pct: number) {
  return CHART_PAD_T + (1 - pct / 100) * CHART_INNER_H;
}

function LineChart({ days, width }: { days: DayAdherenceData[]; width: number }) {
  const svgW = width - Y_LABEL_W;
  const dataAreaW = svgW - CHART_LEFT - CHART_PAD_R;
  const chartBottom = CHART_PAD_T + CHART_INNER_H;
  const chartRight = CHART_LEFT + dataAreaW;

  // Only days with actual recorded data — future dates get no space on the X axis
  const dataPoints = days.filter((d) => d.percentage >= 0);

  if (!dataPoints.length) {
    return (
      <View style={{ height: CHART_SVG_H, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: 13, color: colors.muted }}>No data this month</Text>
      </View>
    );
  }

  const minDay = dataPoints[0].day;
  const maxDay = dataPoints[dataPoints.length - 1].day;
  const span = Math.max(maxDay - minDay, 1);

  // First data point sits on the Y-axis at x=CHART_LEFT.
  // CHART_LEFT prevents the dot from being clipped by the SVG boundary.
  const xFor = (day: number) => CHART_LEFT + ((day - minDay) / span) * dataAreaW;

  const linePath = dataPoints
    .map((pt, i) => `${i === 0 ? "M" : "L"}${xFor(pt.day).toFixed(1)},${yForPct(pt.percentage).toFixed(1)}`)
    .join(" ");

  const areaPath =
    `${linePath}` +
    ` L${xFor(maxDay).toFixed(1)},${chartBottom.toFixed(1)}` +
    ` L${xFor(minDay).toFixed(1)},${chartBottom.toFixed(1)} Z`;

  return (
    <View style={{ flexDirection: "row", height: CHART_SVG_H }}>
      {/*
       * Native label column — labels are absolutely positioned so their vertical
       * centre aligns exactly with yForPct(). This avoids all SvgText font-metrics
       * issues that caused uneven "number / %" spacing and axis overlap.
       */}
      <View style={{ width: Y_LABEL_W, height: CHART_SVG_H }}>
        {[100, 75, 50, 25, 0].map((pct) => (
          <Text
            key={pct}
            style={{
              position: "absolute",
              right: 6,
              top: yForPct(pct) - 5, // -5 centres ~10px-tall text on the grid line
              fontSize: 9,
              lineHeight: 10,
              color: colors.muted,
            }}
          >
            {`${pct}%`}
          </Text>
        ))}
      </View>

      {/* Chart SVG — Y-axis line is at x=CHART_LEFT so the first dot is not clipped */}
      <Svg width={svgW} height={CHART_SVG_H}>
        {/* Y-axis solid line */}
        <SvgLine
          x1={CHART_LEFT}
          y1={CHART_PAD_T}
          x2={CHART_LEFT}
          y2={chartBottom}
          stroke={colors.border}
          strokeWidth={1}
        />

        {/* X-axis solid line */}
        <SvgLine
          x1={CHART_LEFT}
          y1={chartBottom}
          x2={chartRight}
          y2={chartBottom}
          stroke={colors.border}
          strokeWidth={1}
        />

        {/* 100% green dashed target baseline (stays inside chart area) */}
        <SvgLine
          x1={CHART_LEFT}
          y1={yForPct(100)}
          x2={chartRight}
          y2={yForPct(100)}
          stroke={colors.taken}
          strokeWidth={1}
          strokeDasharray="5,3"
        />

        {/* 50% gray dashed reference line */}
        <SvgLine
          x1={CHART_LEFT}
          y1={yForPct(50)}
          x2={chartRight}
          y2={yForPct(50)}
          stroke={colors.border}
          strokeWidth={0.5}
          strokeDasharray="4,3"
        />

        {/* Vertical gray dashed line at each data point */}
        {dataPoints.map((pt) => (
          <SvgLine
            key={`vline-${pt.dateKey}`}
            x1={xFor(pt.day)}
            y1={CHART_PAD_T}
            x2={xFor(pt.day)}
            y2={chartBottom}
            stroke={colors.border}
            strokeWidth={0.5}
            strokeDasharray="3,3"
          />
        ))}

        {/* Area fill */}
        <Path d={areaPath} fill={`${colors.amber}22`} />

        {/* Orange line */}
        <Path
          d={linePath}
          stroke={colors.amber}
          strokeWidth={2.2}
          fill="none"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Orange data-point dots */}
        {dataPoints.map((pt) => (
          <Circle
            key={pt.dateKey}
            cx={xFor(pt.day)}
            cy={yForPct(pt.percentage)}
            r={DOT_R}
            fill={colors.amber}
            stroke="#FFFDF9"
            strokeWidth={1.5}
          />
        ))}

        {/* X-axis labels (one per data point) */}
        {dataPoints.map((pt) => (
          <SvgText
            key={`xlabel-${pt.dateKey}`}
            x={xFor(pt.day)}
            y={CHART_SVG_H - 8}
            textAnchor="middle"
            fontSize={9}
            fill={colors.muted}
          >
            {`${pt.day}`}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}

// ─── DayDoseList ───────────────────────────────────────────────────────────────

function DayDoseList({ dateKey, days }: { dateKey: string; days: DayAdherenceData[] }) {
  const dayData = days.find((d) => d.dateKey === dateKey);
  const date = new Date(`${dateKey}T12:00:00`);
  const label = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <View>
      <Text style={{ fontSize: 17, fontWeight: "700", color: colors.navy, marginBottom: 12 }}>{label}</Text>

      {!dayData || dayData.doseItems.length === 0 ? (
        <View
          style={{
            paddingVertical: 28,
            alignItems: "center",
            backgroundColor: "#FFFFFF",
            borderRadius: 20,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text style={{ fontSize: 13, color: colors.muted }}>No medications scheduled</Text>
        </View>
      ) : (
        <View style={{ gap: 10 }}>
          {dayData.doseItems.map((item) => {
            const isTaken = item.doseEvent.status === "taken";
            const isMissed = item.doseEvent.status === "missed";
            // Show actual taken time when available
            const takenTime =
              isTaken && item.doseEvent.taken_datetime
                ? formatDoseTime(item.doseEvent.taken_datetime.slice(11, 16))
                : null;

            return (
              <View
                key={item.doseEvent.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#FFFFFF",
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: colors.border,
                  padding: 14,
                  shadowColor: colors.navy,
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 2 },
                }}
              >
                {/* Pill icon */}
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 16,
                    backgroundColor: getPillBg(item.medication.color_label),
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                >
                  <LinearGradient
                    colors={[item.gradientTo, item.medication.color_label || colors.amber]}
                    start={{ x: 0, y: 1 }}
                    end={{ x: 1, y: 0 }}
                    style={{ borderRadius: 999, padding: 3 }}
                  >
                    <PillGlyph color="#FFFFFF" width={32} />
                  </LinearGradient>
                </View>

                {/* Name + scheduled/taken time */}
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={{ fontSize: 15, fontWeight: "700", color: colors.navy }}>
                    {item.medication.medication_name}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.muted, marginTop: 3, lineHeight: 17 }}>
                    {"Scheduled: " + formatDoseTime(item.schedule.scheduled_time)}
                    {takenTime ? " · Taken: " + takenTime : ""}
                  </Text>
                </View>

                {/* Status badge */}
                {isTaken ? (
                  <View style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: "#EAF6EF" }}>
                    <Text style={{ fontSize: 12, fontWeight: "600", color: colors.taken }}>{"✓ Taken"}</Text>
                  </View>
                ) : isMissed ? (
                  <View style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: "#FAEAE9" }}>
                    <Text style={{ fontSize: 12, fontWeight: "600", color: colors.missed }}>{"✗ Missed"}</Text>
                  </View>
                ) : (
                  // Pending — gray circle with dash, matching the reference design
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: "#ECEAE6",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontSize: 18, lineHeight: 20, color: colors.muted }}>{"−"}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

// ─── CalendarScreen ────────────────────────────────────────────────────────────

export default function CalendarScreen() {
  const { doseEvents, medications, schedules } = useAppData();
  const { width: screenWidth } = useWindowDimensions();

  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState(todayKey());

  // All three sections read from this single computed source
  const days = buildMonthAdherenceData(viewYear, viewMonth, doseEvents, medications, schedules);
  const overallAdherence = calcOverallAdherence(doseEvents);

  // card inner width = screen - outer horizontal padding (20×2) - card padding (16×2)
  const chartWidth = screenWidth - 72;

  function goToPrevMonth() {
    const newYear = viewMonth === 1 ? viewYear - 1 : viewYear;
    const newMonth = viewMonth === 1 ? 12 : viewMonth - 1;
    setViewYear(newYear);
    setViewMonth(newMonth);
    setSelectedDate(`${newYear}-${String(newMonth).padStart(2, "0")}-01`);
  }

  function goToNextMonth() {
    const newYear = viewMonth === 12 ? viewYear + 1 : viewYear;
    const newMonth = viewMonth === 12 ? 1 : viewMonth + 1;
    setViewYear(newYear);
    setViewMonth(newMonth);
    setSelectedDate(`${newYear}-${String(newMonth).padStart(2, "0")}-01`);
  }

  const cardStyle = {
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 64, paddingBottom: 32 }}
    >
      {/* ── Header ── */}
      <Text style={{ fontSize: 28, fontWeight: "800", color: colors.navy }}>Calendar & History</Text>
      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4, marginBottom: 20 }}>
        <Text style={{ fontSize: 13, color: colors.muted }}>Overall adherence: </Text>
        <Text style={{ fontSize: 13, fontWeight: "700", color: colors.taken }}>{overallAdherence}%</Text>
      </View>

      {/* ── Section 1: Month Calendar ── */}
      <View style={cardStyle}>
        {/* Month navigation */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <Pressable
            onPress={goToPrevMonth}
            style={{
              width: 36, height: 36, borderRadius: 10,
              borderWidth: 1, borderColor: colors.border,
              alignItems: "center", justifyContent: "center",
            }}
          >
            <ChevronLeft color={colors.navy} size={18} />
          </Pressable>

          <Text style={{ fontSize: 16, fontWeight: "700", color: colors.navy }}>
            {MONTH_NAMES[viewMonth - 1]} {viewYear}
          </Text>

          <Pressable
            onPress={goToNextMonth}
            style={{
              width: 36, height: 36, borderRadius: 10,
              borderWidth: 1, borderColor: colors.border,
              alignItems: "center", justifyContent: "center",
            }}
          >
            <ChevronRight color={colors.navy} size={18} />
          </Pressable>
        </View>

        <MonthCalendar
          year={viewYear}
          month={viewMonth}
          days={days}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
      </View>

      {/* ── Section 2: Completion Rate Line Chart ── */}
      <View style={{ ...cardStyle, marginTop: 16 }}>
        <Text style={{ fontSize: 15, fontWeight: "700", color: colors.navy }}>
          Medication Completion Rate (%)
        </Text>
        <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2, marginBottom: 8 }}>
          100% = all medications taken that day
        </Text>
        <LineChart days={days} width={chartWidth} />
      </View>

      {/* ── Section 3: Selected Day Dose List — cards float directly on background ── */}
      <View style={{ marginTop: 16 }}>
        <DayDoseList dateKey={selectedDate} days={days} />
      </View>
    </ScrollView>
  );
}
