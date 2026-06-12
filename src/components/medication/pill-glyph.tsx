import Svg, { ClipPath, Defs, Ellipse, G, Line, Path, Rect } from "react-native-svg";
import type { MedicationRecord } from "@/types/db";

export function PillGlyph({
  color,
  secondaryColor,
  width = 40,
  rotation = -24,
  form = "capsule",
}: {
  color: string;
  secondaryColor?: string;
  width?: number;
  rotation?: number;
  form?: MedicationRecord["form"];
}) {
  const height = width * 0.72;
  const secondary = secondaryColor || color;
  const clipId = `pill-clip-${form}-${color.replace(/[^a-zA-Z0-9]/g, "")}-${secondary.replace(/[^a-zA-Z0-9]/g, "")}-${width}`;

  return (
    <Svg width={width} height={height} viewBox="0 0 80 56" fill="none">
      {form === "capsule" ? (
        <>
          <Defs>
            <ClipPath id={clipId}>
              <Rect x="10" y="14" width="60" height="28" rx="14" />
            </ClipPath>
          </Defs>

          <G transform={`rotate(${rotation} 40 28)`}>
            <Rect x="12" y="16" width="60" height="28" rx="14" fill="rgba(61, 44, 28, 0.12)" />

            <G clipPath={`url(#${clipId})`}>
              <Rect x="10" y="14" width="30" height="28" fill={secondary} />
              <Rect x="40" y="14" width="30" height="28" fill={color} />
            </G>

            <Rect x="10" y="14" width="60" height="28" rx="14" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
            <Line x1="40" y1="16" x2="40" y2="40" stroke="rgba(255,255,255,0.78)" strokeWidth="1.5" />
            <Ellipse cx="30" cy="21" rx="14" ry="4.2" fill="rgba(255,255,255,0.28)" />
          </G>
        </>
      ) : null}

      {form === "tablet" ? (
        <G transform={`rotate(${rotation} 40 28)`}>
          <Ellipse cx="40" cy="29" rx="23" ry="18" fill="rgba(61, 44, 28, 0.12)" />
          <Ellipse cx="40" cy="27" rx="23" ry="18" fill={color} />
          <Path d="M24 27C28 21 34 18 40 18C46 18 52 21 56 27" stroke="rgba(255,255,255,0.22)" strokeWidth="2.2" strokeLinecap="round" />
          <Line x1="40" y1="16" x2="40" y2="38" stroke="rgba(255,255,255,0.72)" strokeWidth="2.4" strokeLinecap="round" />
          <Ellipse cx="34" cy="21" rx="10" ry="4" fill="rgba(255,255,255,0.24)" />
        </G>
      ) : null}

      {form === "softgel" ? (
        <G transform={`rotate(${rotation + 8} 40 28)`}>
          <Ellipse cx="40" cy="31" rx="16" ry="20" fill="rgba(61, 44, 28, 0.14)" />
          <Path
            d="M40 11C49.6 11 57 19.6 57 30C57 40.4 49.6 49 40 49C30.4 49 23 40.4 23 30C23 19.6 30.4 11 40 11Z"
            fill={color}
          />
          <Path
            d="M32 16C27.8 19.4 25 24.4 25 30C25 39.4 31.8 47 40.6 47.8C35.8 43.7 33 37.2 33 29.9C33 24.8 34.4 20.1 37.1 16.3C35.3 15.8 33.5 15.7 32 16Z"
            fill={secondary}
            opacity={0.82}
          />
          <Path d="M34 17C37 15.3 41.2 15 45 16.3C41.7 19 39.4 23.5 38.6 28.8" stroke="rgba(255,255,255,0.42)" strokeWidth="2.2" strokeLinecap="round" />
          <Ellipse cx="35" cy="21" rx="7" ry="4.5" fill="rgba(255,255,255,0.24)" />
        </G>
      ) : null}
    </Svg>
  );
}
