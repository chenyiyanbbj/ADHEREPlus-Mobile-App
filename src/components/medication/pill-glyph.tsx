import Svg, { G, Rect } from "react-native-svg";

export function PillGlyph({
  color,
  width = 40,
}: {
  color: string;
  width?: number;
}) {
  const height = width * 0.6;

  return (
    <Svg width={width} height={height} viewBox="0 0 80 48" fill="none">
      <G transform="rotate(-20 40 24)">
        <Rect x="10" y="12" width="60" height="24" rx="12" fill={color} opacity={0.82} />
        <Rect x="39" y="12" width="2" height="24" rx="1" fill="rgba(255,255,255,0.75)" />
      </G>
    </Svg>
  );
}
