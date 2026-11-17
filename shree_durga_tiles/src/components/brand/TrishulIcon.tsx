import Svg, { Path } from 'react-native-svg';

export function TrishulIcon({ size = 48, color = '#D4B27A' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Path
        d="M24 5v39M12 12v7c0 5 5 8 12 8s12-3 12-8v-7M24 5l-3 6h6zM12 6l-2.5 6h5zM36 6l-2.5 6h5zM19 40h10"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
