import { ReactNode, useLayoutEffect, useMemo, useRef } from "react";
import { InstancedMesh, Object3D, Vector3 } from "three";
import { latLonToVector3, type SurfacePoint } from "./spherical";

type SurfaceInstancesProps = {
  points: SurfacePoint[];
  radius?: number;
  scaleMultiplier?: number;
  children: ReactNode;
};

const UP = new Vector3(0, 1, 0);

export function SurfaceInstances({
  points,
  radius = 1.02,
  scaleMultiplier = 1,
  children
}: SurfaceInstancesProps) {
  const meshRef = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);

  useLayoutEffect(() => {
    const mesh = meshRef.current;

    if (!mesh) {
      return;
    }

    points.forEach((point, index) => {
      const position = latLonToVector3(point.lat, point.lon, radius);
      const normal = position.clone().normalize();

      dummy.position.copy(position);
      dummy.quaternion.setFromUnitVectors(UP, normal);
      dummy.scale.setScalar(point.scale * scaleMultiplier);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
  }, [dummy, points, radius, scaleMultiplier]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, points.length]}>
      {children}
    </instancedMesh>
  );
}
