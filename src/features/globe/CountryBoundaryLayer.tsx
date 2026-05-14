import { Line } from "@react-three/drei";
import type { CountryRecord } from "../../domain/types";
import { latLonToVector3 } from "./spherical";

type CountryBoundaryLayerProps = {
  countries: CountryRecord[];
  zoomScalar: number;
};

export function CountryBoundaryLayer({ countries, zoomScalar }: CountryBoundaryLayerProps) {
  if (zoomScalar < 0.62) {
    return null;
  }

  const maxRank = zoomScalar > 0.84 ? 4 : 3;

  return (
    <group>
      {countries
        .filter((country) => country.importanceRank <= maxRank)
        .map((country) => (
          <Line
            key={country.id}
            points={bboxToRing(country.bbox).map(([lat, lon]) => latLonToVector3(lat, lon, 1.061))}
            color="#f1dca5"
            lineWidth={0.55}
            transparent
            opacity={0.22 + zoomScalar * 0.3}
          />
        ))}
    </group>
  );
}

function bboxToRing([west, south, east, north]: CountryRecord["bbox"]) {
  return [
    [south, west],
    [south, east],
    [north, east],
    [north, west],
    [south, west]
  ] satisfies Array<[number, number]>;
}
