import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  MeshReflectorMaterial,
  OrbitControls,
  RoundedBox,
  Sparkles,
  Text,
} from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { motion } from "framer-motion";
import * as THREE from "three";

const scrollPanels = [
  {
    id: "features",
    progress: 0.2,
    align: "left",
    eyebrow: "01 / Parking Operations",
    title: "Manage parking slots, vehicles, and reservations in one system.",
    description:
      "ParkMaster helps managers control parking floors, zones, slot availability, supported vehicle types, and reservation requests from a single modern dashboard.",
    items: [
      "Slot management",
      "Vehicle types",
      "Reservations",
      "Availability tracking",
    ],
  },
  {
    id: "workflow",
    progress: 0.45,
    align: "right",
    eyebrow: "02 / Entry & Exit Flow",
    title: "Track every parking session from vehicle entry to payment.",
    description:
      "Staff can create parking sessions when vehicles enter, update session status when vehicles exit, let the system calculate fees, and record payment history clearly.",
    items: [
      "Vehicle entry",
      "Active sessions",
      "Fee calculation",
      "Payment records",
    ],
  },
  {
    id: "roles",
    progress: 0.7,
    align: "left",
    eyebrow: "03 / Role-Based System",
    title: "Separate tools for Admin, Manager, Staff, and Parking User.",
    description:
      "Each role gets the right access: administrators manage users and permissions, managers control operations, staff handle daily parking flow, and users can reserve slots and view their history.",
    items: ["ADMIN", "MANAGER", "STAFF", "USER"],
  },
  {
    id: "contact",
    progress: 0.95,
    align: "right",
    eyebrow: "04 / Smart Parking Platform",
    title: "A clean and interactive platform for modern parking buildings.",
    description:
      "The public landing page introduces the system through an immersive 3D parking building experience, while the admin dashboard supports real parking management features behind the scenes.",
    items: ["3D landing page", "Admin dashboard", "Secure access", "Modern UI"],
  },
];

function ScrollPanel({ panel, active }) {
  const alignClass =
    panel.align === "left"
      ? "items-center justify-start px-5 md:px-16 lg:px-24"
      : "items-center justify-end px-5 md:px-16 lg:px-24";

  return (
    <motion.section
      id={panel.id}
      animate={{
        opacity: active ? 1 : 0,
        y: active ? 0 : 40,
        scale: active ? 1 : 0.96,
        pointerEvents: active ? "auto" : "none",
      }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className={`pointer-events-none absolute inset-0 z-30 flex ${alignClass}`}
    >
      <article className="max-w-xl rounded-4xl border border-white/10 bg-slate-900/80 p-7 shadow-[0_30px_80px_rgba(0,0,0,0.5)] backdrop-blur-xl md:p-8">
        <p className="mb-4 text-xs font-black uppercase tracking-[0.24em] text-cyan-400">
          {panel.eyebrow}
        </p>
        <h2 className="text-3xl font-black leading-tight tracking-tight text-white md:text-5xl">
          {panel.title}
        </h2>
        <p className="mt-5 text-base font-medium leading-8 text-slate-300">
          {panel.description}
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          {panel.items.map((item) => (
            <span
              key={item}
              className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-wide text-slate-200 shadow-sm backdrop-blur-sm"
            >
              {item}
            </span>
          ))}
        </div>
      </article>
    </motion.section>
  );
}

// --- PREMIUM CAR (Đã fix z-fighting) ---
function PremiumCar({
  position,
  color = "#2563eb",
  rotation = [0, 0, 0],
  scale = 1,
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Main Body */}
      <RoundedBox args={[1.08, 0.22, 2.15]} radius={0.14} smoothness={4}>
        <meshPhysicalMaterial
          color={color}
          roughness={0.15}
          metalness={0.85}
          clearcoat={1}
          clearcoatRoughness={0.03}
          envMapIntensity={1.5}
        />
      </RoundedBox>

      {/* Lower Body */}
      <RoundedBox
        args={[1.12, 0.09, 2.18]}
        position={[0, -0.11, 0]}
        radius={0.08}
        smoothness={4}
      >
        <meshPhysicalMaterial
          color="#020617"
          roughness={0.3}
          metalness={0.9}
          clearcoat={0.8}
        />
      </RoundedBox>

      {/* Cabin */}
      <RoundedBox
        args={[0.86, 0.26, 1.05]}
        position={[0, 0.23, -0.15]}
        radius={0.12}
        smoothness={4}
      >
        <meshPhysicalMaterial
          color="#0f172a"
          roughness={0.05}
          metalness={0.95}
          clearcoat={1}
          clearcoatRoughness={0.02}
        />
      </RoundedBox>

      {/* Windshield - use polygonOffset to avoid z-fighting */}
      <RoundedBox
        args={[0.82, 0.24, 0.09]}
        position={[0, 0.23, 0.38]}
        radius={0.09}
        smoothness={4}
      >
        <meshPhysicalMaterial
          color="#bfdbfe"
          roughness={0.0}
          metalness={0.1}
          transparent
          opacity={0.85}
          envMapIntensity={2}
          polygonOffset
          polygonOffsetFactor={-1}
        />
      </RoundedBox>

      {/* Rear Window */}
      <RoundedBox
        args={[0.78, 0.2, 0.09]}
        position={[0, 0.21, -0.66]}
        radius={0.09}
        smoothness={4}
        rotation={[0.18, 0, 0]}
      >
        <meshPhysicalMaterial
          color="#bfdbfe"
          roughness={0.0}
          metalness={0.1}
          transparent
          opacity={0.85}
          envMapIntensity={2}
          polygonOffset
          polygonOffsetFactor={-1}
        />
      </RoundedBox>

      {/* Side Windows */}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * 0.44, 0.23, -0.15]}
          rotation={[0, (side * Math.PI) / 2, 0]}
        >
          <planeGeometry args={[0.9, 0.2]} />
          <meshPhysicalMaterial
            color="#1e293b"
            roughness={0.05}
            metalness={0.9}
            transparent
            opacity={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* Headlights */}
      {[-1, 1].map((side) => (
        <group key={`headlight-${side}`} position={[side * 0.34, 0.03, 1.08]}>
          <mesh>
            <boxGeometry args={[0.24, 0.04, 0.03]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={1.5}
            />
          </mesh>
        </group>
      ))}

      {/* Taillights */}
      <mesh position={[0, 0.05, -1.08]}>
        <boxGeometry args={[0.85, 0.03, 0.03]} />
        <meshStandardMaterial
          color="#ef4444"
          emissive="#ef4444"
          emissiveIntensity={1.5}
        />
      </mesh>

      {/* Side Mirrors */}
      {[-1, 1].map((side) => (
        <group
          key={`mirror-${side}`}
          position={[side * 0.52, 0.18, 0.2]}
          rotation={[0, side * 0.3, 0]}
        >
          <RoundedBox args={[0.08, 0.06, 0.12]} radius={0.02} smoothness={4}>
            <meshPhysicalMaterial
              color={color}
              roughness={0.15}
              metalness={0.85}
              clearcoat={1}
            />
          </RoundedBox>
        </group>
      ))}

      {/* Wheels */}
      {[
        [-0.56, -0.11, 0.72],
        [0.56, -0.11, 0.72],
        [-0.56, -0.11, -0.72],
        [0.56, -0.11, -0.72],
      ].map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]} rotation={[0, 0, Math.PI / 2]}>
          <mesh>
            <cylinderGeometry args={[0.18, 0.18, 0.13, 24]} />
            <meshStandardMaterial color="#0f172a" roughness={0.95} />
          </mesh>
          <mesh position={[0, 0, 0.07]}>
            <cylinderGeometry args={[0.12, 0.12, 0.02, 24]} />
            <meshPhysicalMaterial
              color="#e2e8f0"
              roughness={0.1}
              metalness={0.95}
              clearcoat={0.9}
            />
          </mesh>
          {[0, 60, 120, 180, 240, 300].map((angle, j) => (
            <mesh
              key={j}
              position={[0, 0, 0.075]}
              rotation={[0, 0, (angle * Math.PI) / 180]}
            >
              <boxGeometry args={[0.02, 0.2, 0.015]} />
              <meshPhysicalMaterial
                color="#94a3b8"
                roughness={0.2}
                metalness={0.9}
              />
            </mesh>
          ))}
          <mesh position={[0, 0, 0.08]}>
            <cylinderGeometry args={[0.04, 0.04, 0.03, 12]} />
            <meshPhysicalMaterial
              color="#1e293b"
              roughness={0.25}
              metalness={0.85}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// --- SLOT SIGNAL (Increased distance to avoid z-fighting) ---
function SlotSignal({ color = "#22c55e" }) {
  return (
    <group>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.42, 0.46, 48]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
        />
      </mesh>
      <mesh position={[0, 0.025, 0.57]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.85, 0.08]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.9}
        />
      </mesh>
      <pointLight
        position={[0, 0.3, 0]}
        intensity={0.2}
        distance={1.5}
        color={color}
      />
    </group>
  );
}

function ParkingSlot({ position, state = "available", carColor = "#2563eb" }) {
  const color =
    state === "occupied"
      ? "#ef4444"
      : state === "reserved"
        ? "#f59e0b"
        : "#22c55e";
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.32, 2.06]} />
        <meshStandardMaterial color="#1e293b" roughness={0.85} />
      </mesh>
      <SlotSignal color={color} />
      {state === "occupied" && (
        <PremiumCar position={[0, 0.25, 0]} color={carColor} scale={0.72} />
      )}
    </group>
  );
}

// --- PARKING DECK (Fixed z-fighting thoroughly) ---
function ParkingDeck({ y = 0, slots = [] }) {
  return (
    <group position={[0, y, 0]}>
      {/* Main Floor */}
      <RoundedBox args={[10.4, 0.2, 6.4]} radius={0.12} smoothness={4}>
        <meshStandardMaterial
          color="#334155"
          roughness={0.85}
          metalness={0.15}
        />
      </RoundedBox>

      {/* Glowing Edge */}
      <mesh position={[0, -0.11, 0]}>
        <boxGeometry args={[10.5, 0.05, 6.5]} />
        <meshStandardMaterial
          color="#06b6d4"
          emissive="#06b6d4"
          emissiveIntensity={1.2}
        />
      </mesh>

      {/* Driving Lane - TĂNG KHOẢNG CÁCH rõ rệt */}
      <mesh position={[0, 0.11, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.5, 6.2]} />
        <meshStandardMaterial
          color="#1e293b"
          roughness={0.92}
          polygonOffset
          polygonOffsetFactor={1}
        />
      </mesh>

      {/* Lane Markings - đặt cao hơn hẳn */}
      {[-1.8, -0.9, 0, 0.9, 1.8].map((z, i) => (
        <mesh key={i} position={[0, 0.12, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.08, 0.5]} />
          <meshStandardMaterial
            color="#fbbf24"
            emissive="#fbbf24"
            emissiveIntensity={0.6}
          />
        </mesh>
      ))}

      {/* Parking Lines */}
      {slots.map((slot, index) => (
        <group key={`lines-${index}`} position={[slot.x, 0.12, slot.z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.05, 1.9]} />
            <meshStandardMaterial color="#64748b" roughness={0.7} />
          </mesh>
        </group>
      ))}

      {/* Columns */}
      {[
        [-4.8, -2.8],
        [4.8, -2.8],
        [-4.8, 2.8],
        [4.8, 2.8],
        [-2.5, 0],
        [2.5, 0],
      ].map(([x, z], index) => (
        <group key={`column-${index}`} position={[x, 0.95, z]}>
          <mesh>
            <cylinderGeometry args={[0.14, 0.14, 1.7, 16]} />
            <meshStandardMaterial
              color="#475569"
              roughness={0.75}
              metalness={0.2}
            />
          </mesh>
          <mesh position={[0, -0.8, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.06, 16]} />
            <meshPhysicalMaterial
              color="#64748b"
              roughness={0.3}
              metalness={0.9}
              clearcoat={0.6}
            />
          </mesh>
          <mesh position={[0, 0.2, 0.16]}>
            <boxGeometry args={[0.025, 0.5, 0.025]} />
            <meshStandardMaterial
              color="#06b6d4"
              emissive="#06b6d4"
              emissiveIntensity={2}
            />
          </mesh>
          <mesh position={[0, 0.85, 0]}>
            <cylinderGeometry args={[0.16, 0.14, 0.08, 16]} />
            <meshStandardMaterial
              color="#64748b"
              roughness={0.6}
              metalness={0.3}
            />
          </mesh>
        </group>
      ))}

      {/* Glass Railings */}
      {[-1, 1].map((side) => (
        <group key={`railing-${side}`} position={[0, 0.7, side * 3.1]}>
          <mesh>
            <boxGeometry args={[10.2, 0.6, 0.06]} />
            <meshPhysicalMaterial
              color="#60a5fa"
              roughness={0.05}
              metalness={0.0}
              transparent
              opacity={0.25}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh position={[0, 0.32, 0]}>
            <boxGeometry args={[10.3, 0.05, 0.07]} />
            <meshPhysicalMaterial
              color="#475569"
              roughness={0.2}
              metalness={0.9}
              clearcoat={0.9}
            />
          </mesh>
        </group>
      ))}

      {/* Slots */}
      {slots.map((slot, index) => (
        <ParkingSlot
          key={index}
          position={[slot.x, 0.13, slot.z]}
          state={slot.state}
          carColor={slot.carColor}
        />
      ))}
    </group>
  );
}

function Ramp({ position, rotation }) {
  return (
    <group position={position} rotation={rotation}>
      <RoundedBox args={[1.5, 0.14, 3.5]} radius={0.06} smoothness={4}>
        <meshStandardMaterial
          color="#334155"
          roughness={0.9}
          metalness={0.15}
        />
      </RoundedBox>

      {[-1.4, -0.7, 0, 0.7, 1.4].map((z, i) => (
        <mesh key={i} position={[0, 0.08, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.3, 0.15]} />
          <meshStandardMaterial
            color="#fbbf24"
            emissive="#fbbf24"
            emissiveIntensity={0.8}
          />
        </mesh>
      ))}

      {[-1, 1].map((side) => (
        <group key={`guardrail-${side}`} position={[side * 0.75, 0.25, 0]}>
          {[-1.5, 0, 1.5].map((z, i) => (
            <mesh key={i} position={[0, 0, z]}>
              <cylinderGeometry args={[0.03, 0.03, 0.4, 12]} />
              <meshPhysicalMaterial
                color="#64748b"
                roughness={0.3}
                metalness={0.9}
                clearcoat={0.7}
              />
            </mesh>
          ))}
          <mesh position={[0, 0.18, 0]}>
            <boxGeometry args={[0.04, 0.04, 3.5]} />
            <meshPhysicalMaterial
              color="#475569"
              roughness={0.2}
              metalness={0.9}
              clearcoat={0.9}
            />
          </mesh>
          <mesh position={[0, 0.15, 0]}>
            <boxGeometry args={[0.025, 0.025, 3.4]} />
            <meshStandardMaterial
              color="#06b6d4"
              emissive="#06b6d4"
              emissiveIntensity={2}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function SideControlPylon() {
  return (
    <group position={[-5.3, 0.5, -2.9]} rotation={[0, 0.15, 0]}>
      <RoundedBox args={[0.38, 0.95, 0.38]} radius={0.08} smoothness={4}>
        <meshPhysicalMaterial
          color="#0f172a"
          roughness={0.25}
          metalness={0.85}
          clearcoat={0.8}
        />
      </RoundedBox>

      <RoundedBox
        position={[0, 0.18, 0.22]}
        args={[0.26, 0.34, 0.06]}
        radius={0.05}
        smoothness={4}
      >
        <meshPhysicalMaterial
          color="#020617"
          roughness={0.1}
          metalness={0.9}
          clearcoat={1}
        />
      </RoundedBox>

      <mesh position={[0, 0.18, 0.26]}>
        <planeGeometry args={[0.2, 0.28]} />
        <meshStandardMaterial
          color="#06b6d4"
          emissive="#06b6d4"
          emissiveIntensity={2.5}
        />
      </mesh>

      <mesh position={[0, -0.12, 0.21]}>
        <boxGeometry args={[0.14, 0.05, 0.04]} />
        <meshPhysicalMaterial
          color="#475569"
          roughness={0.4}
          metalness={0.8}
          clearcoat={0.6}
        />
      </mesh>

      <mesh position={[0, 0.42, 0.21]}>
        <sphereGeometry args={[0.025, 12, 12]} />
        <meshStandardMaterial
          color="#22c55e"
          emissive="#22c55e"
          emissiveIntensity={2.5}
        />
      </mesh>

      <group position={[0, 0.72, 0]}>
        <mesh>
          <cylinderGeometry args={[0.14, 0.14, 0.06, 24]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={1.2}
          />
        </mesh>
        <Text
          position={[0, 0.07, 0]}
          fontSize={0.12}
          color="#06b6d4"
          anchorX="center"
          anchorY="middle"
          fontWeight={900}
        >
          P
        </Text>
      </group>
    </group>
  );
}

function BarrierGate() {
  return (
    <group position={[-5.3, 0, 2.7]} rotation={[0, 0.15, 0]}>
      <RoundedBox args={[0.34, 0.5, 0.34]} radius={0.06} smoothness={4}>
        <meshPhysicalMaterial
          color="#0f172a"
          roughness={0.25}
          metalness={0.85}
          clearcoat={0.8}
        />
      </RoundedBox>

      <mesh position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.1, 16]} />
        <meshPhysicalMaterial
          color="#64748b"
          roughness={0.2}
          metalness={0.95}
          clearcoat={0.9}
        />
      </mesh>

      <group position={[0, 0.38, 0]} rotation={[0, 0, -0.18]}>
        <RoundedBox
          args={[0.07, 0.07, 1.7]}
          position={[0.85, 0, 0]}
          radius={0.035}
          smoothness={4}
        >
          <meshPhysicalMaterial
            color="#1e293b"
            roughness={0.3}
            metalness={0.5}
            clearcoat={0.95}
          />
        </RoundedBox>
        <mesh position={[0.85, 0.04, 0]}>
          <boxGeometry args={[0.025, 0.025, 1.6]} />
          <meshStandardMaterial
            color="#ef4444"
            emissive="#ef4444"
            emissiveIntensity={2.5}
          />
        </mesh>
        <mesh position={[1.7, 0, 0]}>
          <boxGeometry args={[0.09, 0.09, 0.09]} />
          <meshStandardMaterial
            color="#ef4444"
            emissive="#ef4444"
            emissiveIntensity={1.8}
          />
        </mesh>
      </group>

      <mesh position={[0, 0.28, 0.18]}>
        <sphereGeometry args={[0.025, 12, 12]} />
        <meshStandardMaterial
          color="#22c55e"
          emissive="#22c55e"
          emissiveIntensity={2.5}
        />
      </mesh>
    </group>
  );
}

function HoloPanel({ position, rotation = [0, 0, 0], scale = 1 }) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <RoundedBox args={[2.3, 1.4, 0.06]} radius={0.1} smoothness={4}>
        <meshPhysicalMaterial
          color="#06b6d4"
          roughness={0.05}
          metalness={0.1}
          transparent
          opacity={0.15}
          envMapIntensity={2}
          side={THREE.DoubleSide}
        />
      </RoundedBox>

      {[
        [0.35, "#06b6d4", 1.7],
        [0.05, "#a78bfa", 1.3],
        [-0.25, "#34d399", 0.9],
      ].map(([y, color, width], i) => (
        <mesh key={i} position={[0, y, 0.04]}>
          <planeGeometry args={[width, 0.12]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={2.5}
            transparent
            opacity={0.95}
          />
        </mesh>
      ))}

      {[-1, 1].map((x) =>
        [-1, 1].map((y) => (
          <mesh key={`${x}-${y}`} position={[x * 1.1, y * 0.65, 0.04]}>
            <boxGeometry args={[0.08, 0.08, 0.025]} />
            <meshStandardMaterial
              color="#06b6d4"
              emissive="#06b6d4"
              emissiveIntensity={2.5}
            />
          </mesh>
        )),
      )}

      <mesh position={[0, 0, -0.035]}>
        <boxGeometry args={[2.35, 1.45, 0.025]} />
        <meshPhysicalMaterial
          color="#1e293b"
          roughness={0.3}
          metalness={0.9}
          clearcoat={0.7}
        />
      </mesh>
    </group>
  );
}

function ParkingBuilding({ progressRef }) {
  const rootRef = useRef(null);
  const cameraTarget = useRef(new THREE.Vector3());
  const lookAtTarget = useRef(new THREE.Vector3(0, 1.05, 0));

  const lowerSlots = useMemo(
    () => [
      { x: -3.2, z: -1.45, state: "occupied", carColor: "#2563eb" },
      { x: -1.05, z: -1.45, state: "available" },
      { x: 1.05, z: -1.45, state: "reserved" },
      { x: 3.2, z: -1.45, state: "occupied", carColor: "#06b6d4" },
      { x: -3.2, z: 1.35, state: "available" },
      { x: -1.05, z: 1.35, state: "occupied", carColor: "#f97316" },
      { x: 1.05, z: 1.35, state: "available" },
      { x: 3.2, z: 1.35, state: "reserved" },
    ],
    [],
  );

  const upperSlots = useMemo(
    () => [
      { x: -3.2, z: -1.45, state: "available" },
      { x: -1.05, z: -1.45, state: "occupied", carColor: "#8b5cf6" },
      { x: 1.05, z: -1.45, state: "available" },
      { x: 3.2, z: -1.45, state: "reserved" },
      { x: -3.2, z: 1.35, state: "occupied", carColor: "#ef4444" },
      { x: -1.05, z: 1.35, state: "available" },
      { x: 1.05, z: 1.35, state: "reserved" },
      { x: 3.2, z: 1.35, state: "available" },
    ],
    [],
  );

  useFrame((state) => {
    const progress = progressRef.current || 0;
    const time = state.clock.elapsedTime;

    if (rootRef.current) {
      const targetRotation = -0.72 + progress * Math.PI * 2;
      rootRef.current.rotation.y +=
        (targetRotation - rootRef.current.rotation.y) * 0.055;
      rootRef.current.position.y = -0.28 + Math.sin(time * 0.55) * 0.025;
      rootRef.current.position.x = Math.sin(progress * Math.PI * 2) * 0.16;
    }

    cameraTarget.current.set(
      Math.sin(progress * Math.PI * 2) * 0.7,
      4.65 + Math.sin(progress * Math.PI) * 0.45,
      11.4 - Math.sin(progress * Math.PI) * 0.7,
    );

    state.camera.position.lerp(cameraTarget.current, 0.04);
    state.camera.lookAt(lookAtTarget.current);
  });

  return (
    <group ref={rootRef} position={[0, -0.28, 0]} rotation={[0.16, -0.72, 0]}>
      <RoundedBox
        args={[12.2, 0.32, 8.7]}
        position={[0, -0.52, 0]}
        radius={0.22}
        smoothness={4}
      >
        <meshStandardMaterial
          color="#0f172a"
          roughness={0.65}
          metalness={0.3}
        />
      </RoundedBox>

      <ParkingDeck y={0} slots={lowerSlots} />
      <ParkingDeck y={1.65} slots={upperSlots} />

      <Ramp position={[-5.1, 0.88, 2.22]} rotation={[0, 0, -0.36]} />
      <Ramp position={[5.1, 0.88, -2.22]} rotation={[0, 0, 0.36]} />

      <SideControlPylon />
      <BarrierGate />

      <HoloPanel position={[-3.9, 3.05, 2.65]} rotation={[0.18, 0.3, -0.08]} />
      <HoloPanel
        position={[3.95, 2.55, -2.8]}
        rotation={[0.16, -0.42, 0.06]}
        scale={0.96}
      />
    </group>
  );
}

function HeroScene({ progressRef }) {
  return (
    <>
      <color attach="background" args={["#050510"]} />
      <fog attach="fog" args={["#050510", 18, 40]} />

      <ambientLight intensity={0.4} />

      <spotLight
        color="#ff40a0"
        intensity={30}
        angle={0.6}
        penumbra={0.5}
        position={[5, 8, 0]}
        castShadow={false}
      />

      <spotLight
        color="#2080ff"
        intensity={30}
        angle={0.6}
        penumbra={0.5}
        position={[-5, 8, 0]}
        castShadow={false}
      />

      <directionalLight position={[5, 10, 5]} intensity={0.8} color="#ffffff" />
      <pointLight position={[0, 5, 0]} intensity={0.4} color="#ffffff" />
      <pointLight position={[2.5, 3.2, 2.5]} intensity={0.25} color="#06b6d4" />
      <pointLight
        position={[-3.2, 2.8, -2.5]}
        intensity={0.25}
        color="#a78bfa"
      />

      <Environment preset="city" />

      <Sparkles
        count={40}
        size={2}
        speed={0.15}
        opacity={0.12}
        scale={[14, 8, 14]}
        color="#06b6d4"
      />

      <ParkingBuilding progressRef={progressRef} />

      {/* FIXED THOROUGHLY: Simple, safe MeshReflectorMaterial */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.28, 0]}>
        <planeGeometry args={[50, 50]} />
        <MeshReflectorMaterial
          blur={[200, 100]}
          resolution={512}
          mixBlur={5}
          mixStrength={8}
          roughness={0.85}
          depthScale={0.5}
          minDepthThreshold={0.7}
          maxDepthThreshold={1}
          color="#050510"
          metalness={0.5}
          mirror={0.4}
        />
      </mesh>

      <OrbitControls
        enableDamping
        dampingFactor={0.08}
        enablePan={false}
        enableZoom={false}
        rotateSpeed={0.55}
        minPolarAngle={Math.PI / 3.15}
        maxPolarAngle={Math.PI / 2.02}
      />
    </>
  );
}

export default function PremiumHero3D() {
  const sectionRef = useRef(null);
  const progressRef = useRef(0);
  const [activePanelIndex, setActivePanelIndex] = useState(-1);

  useEffect(() => {
    const updateProgress = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const scrollableDistance =
        sectionRef.current.offsetHeight - window.innerHeight;
      if (scrollableDistance <= 0) {
        progressRef.current = 0;
        return;
      }
      const progress = THREE.MathUtils.clamp(
        -rect.top / scrollableDistance,
        0,
        1,
      );
      progressRef.current = progress;

      let nextActiveIndex = -1;
      if (progress >= 0.12) {
        let closestDistance = Number.POSITIVE_INFINITY;
        scrollPanels.forEach((panel, index) => {
          const distance = Math.abs(progress - panel.progress);
          if (distance < closestDistance) {
            closestDistance = distance;
            nextActiveIndex = index;
          }
        });
      }
      setActivePanelIndex((currentIndex) =>
        currentIndex === nextActiveIndex ? currentIndex : nextActiveIndex,
      );
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative h-[520vh] bg-[radial-gradient(circle_at_top_left,#050510_0%,#0a0a20_34%,#050510_78%)]"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-20 bg-[linear-gradient(to_right,rgba(6,182,212,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(6,182,212,0.08)_1px,transparent_1px)] bg-size-[56px_56px]" />

        <div className="pointer-events-none absolute left-[-10%] top-[-15%] h-104 w-104 rounded-full bg-purple-900/40 blur-3xl" />
        <div className="pointer-events-none absolute right-[-10%] top-[8%] h-112 w-md rounded-full bg-cyan-900/40 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-12%] left-[20%] h-96 w-96 rounded-full bg-blue-900/30 blur-3xl" />

        <Canvas
          dpr={1.2}
          gl={{
            antialias: true,
            alpha: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            outputColorSpace: THREE.SRGBColorSpace,
            powerPreference: "high-performance",
          }}
          onCreated={({ gl }) => {
            gl.toneMappingExposure = 0.9;
          }}
          camera={{ position: [0, 4.65, 11.4], fov: 34 }}
          style={{ background: "transparent" }}
        >
          <Suspense fallback={null}>
            <HeroScene progressRef={progressRef} />
            <EffectComposer>
              <Bloom
                intensity={0.6}
                luminanceThreshold={0.3}
                luminanceSmoothing={0.9}
                mipmapBlur
              />
              <Vignette eskil={false} offset={0.05} darkness={0.3} />
            </EffectComposer>
          </Suspense>
        </Canvas>

        <div className="pointer-events-none absolute inset-0 z-30">
          {scrollPanels.map((panel, index) => (
            <ScrollPanel
              key={panel.id}
              panel={panel}
              active={index === activePanelIndex}
            />
          ))}
        </div>

        <div className="pointer-events-none absolute bottom-8 left-1/2 z-20 -translate-x-1/2 text-center">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-400">
            Scroll to explore
          </p>
          <div className="mx-auto mt-3 h-10 w-6 rounded-full border border-cyan-400/50 p-1">
            <div className="mx-auto h-2 w-2 animate-bounce rounded-full bg-cyan-400" />
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-[#050510] to-transparent" />
      </div>
    </section>
  );
}
