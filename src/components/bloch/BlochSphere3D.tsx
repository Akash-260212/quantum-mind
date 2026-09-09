import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { BlochCoords } from '../../quantum/types';
import { sounds } from '../../utils/audio';
import {
  RotateCw,
  Compass,
  ShieldAlert,
  Sparkles,
  Sliders,
  Plus,
  Minus,
  RotateCcw,
  Zap
} from 'lucide-react';

interface BlochSphere3DProps {
  blochCoordsRecord: Record<number, BlochCoords>;
  numQubits: number;
  selectedQubit: number;
  onSelectQubit: (q: number) => void;
  onAddQubit?: () => void;
  onRemoveQubit?: () => void;
  onApplyGateDirect?: (gateType: 'H' | 'X' | 'Y' | 'Z' | 'S' | 'RESET') => void;
}

export const BlochSphere3D: React.FC<BlochSphere3DProps> = ({
  blochCoordsRecord,
  numQubits,
  selectedQubit,
  onSelectQubit,
  onAddQubit,
  onRemoveQubit,
  onApplyGateDirect
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<THREE.Group | null>(null);
  const projRef = useRef<THREE.Line | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  const [isRotating, setIsRotating] = useState<boolean>(true);

  // Manual interactive state editing values
  const currentCoords = blochCoordsRecord[selectedQubit] || { x: 0, y: 0, z: 1, theta: 0, phi: 0, pure: true };
  const [interactiveTheta, setInteractiveTheta] = useState<number>(currentCoords.theta);
  const [interactivePhi, setInteractivePhi] = useState<number>(currentCoords.phi);
  const [isManualOverride, setIsManualOverride] = useState<boolean>(false);

  useEffect(() => {
    if (!isManualOverride) {
      setInteractiveTheta(currentCoords.theta);
      setInteractivePhi(currentCoords.phi);
    }
  }, [currentCoords, isManualOverride]);

  const activeTheta = isManualOverride ? interactiveTheta : currentCoords.theta;
  const activePhi = isManualOverride ? interactivePhi : currentCoords.phi;

  const displayX = isManualOverride ? Math.sin(activeTheta) * Math.cos(activePhi) : currentCoords.x;
  const displayY = isManualOverride ? Math.sin(activeTheta) * Math.sin(activePhi) : currentCoords.y;
  const displayZ = isManualOverride ? Math.cos(activeTheta) : currentCoords.z;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight || 340;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(2.4, 2.0, 3.2);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambient = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0x0f62fe, 1.2);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    const dirLight2 = new THREE.DirectionalLight(0x0072c3, 0.8);
    dirLight2.position.set(-5, -5, -5);
    scene.add(dirLight2);

    const sphereGroup = new THREE.Group();
    scene.add(sphereGroup);

    // Semi-transparent sphere
    const sphereGeo = new THREE.SphereGeometry(1, 32, 32);
    const sphereMat = new THREE.MeshPhysicalMaterial({
      color: 0xe2e8f0,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      metalness: 0.05,
      transmission: 0.6,
      clearcoat: 0.5
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    sphereGroup.add(sphereMesh);

    // Equator Ring (XY Plane)
    const equatorGeo = new THREE.RingGeometry(0.995, 1.005, 64);
    const equatorMat = new THREE.MeshBasicMaterial({ color: 0x0f62fe, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
    const equator = new THREE.Mesh(equatorGeo, equatorMat);
    equator.rotation.x = Math.PI / 2;
    sphereGroup.add(equator);

    // Meridian Ring (XZ Plane)
    const meridianGeo = new THREE.RingGeometry(0.995, 1.005, 64);
    const meridianMat = new THREE.MeshBasicMaterial({ color: 0x8a3ffc, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
    const meridian = new THREE.Mesh(meridianGeo, meridianMat);
    sphereGroup.add(meridian);

    // Meridian Ring (YZ Plane)
    const meridian2Geo = new THREE.RingGeometry(0.995, 1.005, 64);
    const meridian2Mat = new THREE.MeshBasicMaterial({ color: 0x007d79, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
    const meridian2 = new THREE.Mesh(meridian2Geo, meridian2Mat);
    meridian2.rotation.y = Math.PI / 2;
    sphereGroup.add(meridian2);

    // Coordinate Axes
    const createAxis = (from: THREE.Vector3, to: THREE.Vector3, color: number) => {
      const lineGeo = new THREE.BufferGeometry().setFromPoints([from, to]);
      const lineMat = new THREE.LineBasicMaterial({ color, opacity: 0.7, transparent: true });
      return new THREE.Line(lineGeo, lineMat);
    };

    sphereGroup.add(createAxis(new THREE.Vector3(-1.25, 0, 0), new THREE.Vector3(1.25, 0, 0), 0xda1e28)); // X Red
    sphereGroup.add(createAxis(new THREE.Vector3(0, -1.25, 0), new THREE.Vector3(0, 1.25, 0), 0x198038)); // Y Green
    sphereGroup.add(createAxis(new THREE.Vector3(0, 0, -1.25), new THREE.Vector3(0, 0, 1.25), 0x0f62fe)); // Z Blue

    // Arrow Group
    const arrowGroup = new THREE.Group();
    arrowRef.current = arrowGroup;

    const stemGeo = new THREE.CylinderGeometry(0.025, 0.025, 1, 16);
    stemGeo.translate(0, 0.5, 0);
    const arrowMat = new THREE.MeshStandardMaterial({
      color: 0x0f62fe,
      roughness: 0.2
    });
    const stem = new THREE.Mesh(stemGeo, arrowMat);
    arrowGroup.add(stem);

    const headGeo = new THREE.ConeGeometry(0.07, 0.18, 16);
    headGeo.translate(0, 1.05, 0);
    const headMat = new THREE.MeshStandardMaterial({
      color: 0x002d9c
    });
    const head = new THREE.Mesh(headGeo, headMat);
    arrowGroup.add(head);

    sphereGroup.add(arrowGroup);

    // Projection dashed line
    const projGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0)]);
    const projMat = new THREE.LineDashedMaterial({ color: 0x0043ce, dashSize: 0.05, gapSize: 0.03 });
    const projLine = new THREE.Line(projGeo, projMat);
    projRef.current = projLine;
    sphereGroup.add(projLine);

    // Mouse drag rotation
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      sphereGroup.rotation.y += deltaX * 0.008;
      sphereGroup.rotation.x += deltaY * 0.008;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    mount.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    const handleResize = () => {
      if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight || 340;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (isRotating && !isDragging) {
        sphereGroup.rotation.y += 0.003;
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      mount.removeEventListener('mousedown', handleMouseDown);
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isRotating]);

  // Update State Vector orientation whenever coordinates change
  useEffect(() => {
    if (!arrowRef.current) return;

    const targetDir = new THREE.Vector3(displayX, displayZ, displayY);
    const len = Math.max(0.1, targetDir.length());

    arrowRef.current.scale.set(1, len, 1);

    const defaultUp = new THREE.Vector3(0, 1, 0);
    const normDir = targetDir.clone().normalize();
    const quaternion = new THREE.Quaternion().setFromUnitVectors(defaultUp, normDir);
    arrowRef.current.setRotationFromQuaternion(quaternion);

    if (projRef.current) {
      projRef.current.geometry.setFromPoints([
        new THREE.Vector3(displayX, displayZ, displayY),
        new THREE.Vector3(displayX, 0, displayY)
      ]);
      projRef.current.computeLineDistances();
    }
  }, [displayX, displayY, displayZ]);

  const handleSetPreset = (theta: number, phi: number) => {
    sounds.playClick();
    setIsManualOverride(true);
    setInteractiveTheta(theta);
    setInteractivePhi(phi);
  };

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-200 gap-2">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-[#0f62fe]" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">Interactive 3D Bloch Sphere Studio</h3>
            <p className="text-[11px] text-slate-500">Rotate single-qubit statevectors and test basis transformations</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Rotate Toggle */}
          <button
            onClick={() => setIsRotating(!isRotating)}
            className={`px-2.5 py-1 rounded text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
              isRotating
                ? 'bg-blue-50 text-[#0f62fe] border border-blue-200 font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            title="Toggle Continuous Rotation"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
            <span>{isRotating ? 'Orbit' : 'Paused'}</span>
          </button>
        </div>
      </div>

      {/* Qubit Wire Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-700 font-semibold font-mono">Select Wire:</span>
          {Array.from({ length: numQubits }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                sounds.playClick();
                setIsManualOverride(false);
                onSelectQubit(idx);
              }}
              className={`px-3 py-1 rounded text-xs font-mono font-bold transition-colors cursor-pointer ${
                selectedQubit === idx
                  ? 'bg-[#0f62fe] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              q[{idx}]
            </button>
          ))}
        </div>

        {isManualOverride && (
          <button
            onClick={() => {
              sounds.playClick();
              setIsManualOverride(false);
            }}
            className="text-xs px-2.5 py-1 rounded bg-amber-100 text-amber-900 hover:bg-amber-200 font-semibold cursor-pointer"
          >
            Reset to Circuit State
          </button>
        )}
      </div>

      {/* 3D WebGL Canvas Container */}
      <div className="relative flex-1 min-h-[300px] w-full rounded-xl overflow-hidden bg-slate-50 border border-slate-200 shadow-inner mt-2">
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* State Label Floating Badges */}
        <div className="absolute top-2 left-3 pointer-events-none flex flex-col gap-1 text-[11px] font-mono">
          <div className="flex items-center gap-1.5 text-blue-800 bg-white/90 px-2 py-0.5 rounded shadow-xs border border-blue-200">
            <span className="w-2 h-2 rounded-full bg-[#0f62fe]"></span>
            |0⟩ North Pole (Z = +1)
          </div>
          <div className="flex items-center gap-1.5 text-slate-800 bg-white/90 px-2 py-0.5 rounded shadow-xs border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-slate-600"></span>
            |1⟩ South Pole (Z = -1)
          </div>
          <div className="flex items-center gap-1.5 text-red-800 bg-white/90 px-2 py-0.5 rounded shadow-xs border border-red-200">
            <span className="w-2 h-2 rounded-full bg-[#fa4d56]"></span>
            |+⟩ Superposition (+X)
          </div>
        </div>

        {/* Entanglement Warning if mixed */}
        {!currentCoords.pure && !isManualOverride && (
          <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-xs shadow-xs">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Entangled State:</strong> Wire q[{selectedQubit}] is non-locally entangled with other qubits (state vector contracted).
            </span>
          </div>
        )}
      </div>

      {/* DIRECT INTERACTIVE STATE MANIPULATION CONTROLS */}
      <div className="mt-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-800">
          <span className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-[#0f62fe]" />
            Direct Pole Presets:
          </span>
          {isManualOverride && (
            <span className="text-[10px] font-mono text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-semibold">
              Manual Override
            </span>
          )}
        </div>

        {/* Quick Pole Preset Buttons */}
        <div className="grid grid-cols-6 gap-1.5 text-xs font-mono">
          <button
            onClick={() => handleSetPreset(0, 0)}
            className="py-1 px-2 rounded bg-white hover:bg-blue-50 border border-slate-300 font-bold text-blue-700 transition-colors cursor-pointer"
            title="North Pole |0⟩"
          >
            |0⟩
          </button>
          <button
            onClick={() => handleSetPreset(Math.PI, 0)}
            className="py-1 px-2 rounded bg-white hover:bg-blue-50 border border-slate-300 font-bold text-slate-800 transition-colors cursor-pointer"
            title="South Pole |1⟩"
          >
            |1⟩
          </button>
          <button
            onClick={() => handleSetPreset(Math.PI / 2, 0)}
            className="py-1 px-2 rounded bg-white hover:bg-blue-50 border border-slate-300 font-bold text-red-700 transition-colors cursor-pointer"
            title="Superposition |+⟩"
          >
            |+⟩
          </button>
          <button
            onClick={() => handleSetPreset(Math.PI / 2, Math.PI)}
            className="py-1 px-2 rounded bg-white hover:bg-blue-50 border border-slate-300 font-bold text-red-700 transition-colors cursor-pointer"
            title="Phase Inverted |-⟩"
          >
            |-⟩
          </button>
          <button
            onClick={() => handleSetPreset(Math.PI / 2, Math.PI / 2)}
            className="py-1 px-2 rounded bg-white hover:bg-blue-50 border border-slate-300 font-bold text-purple-700 transition-colors cursor-pointer"
            title="Circular |i⟩"
          >
            |i⟩
          </button>
          <button
            onClick={() => handleSetPreset(Math.PI / 2, (3 * Math.PI) / 2)}
            className="py-1 px-2 rounded bg-white hover:bg-blue-50 border border-slate-300 font-bold text-purple-700 transition-colors cursor-pointer"
            title="Circular |-i⟩"
          >
            |-i⟩
          </button>
        </div>

        {/* Sliders for Theta and Phi */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-slate-600 w-16">θ (Polar):</span>
            <input
              type="range"
              min="0"
              max={Math.PI}
              step="0.05"
              value={activeTheta}
              onChange={(e) => {
                setIsManualOverride(true);
                setInteractiveTheta(parseFloat(e.target.value));
              }}
              className="flex-1 accent-[#0f62fe] cursor-pointer"
            />
            <span className="font-mono text-slate-800 font-bold w-12 text-right">
              {((activeTheta * 180) / Math.PI).toFixed(0)}°
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-slate-600 w-16">φ (Azimuth):</span>
            <input
              type="range"
              min="0"
              max={2 * Math.PI}
              step="0.05"
              value={activePhi}
              onChange={(e) => {
                setIsManualOverride(true);
                setInteractivePhi(parseFloat(e.target.value));
              }}
              className="flex-1 accent-[#0f62fe] cursor-pointer"
            />
            <span className="font-mono text-slate-800 font-bold w-12 text-right">
              {((activePhi * 180) / Math.PI).toFixed(0)}°
            </span>
          </div>
        </div>
      </div>

      {/* Coordinate & Polar Readout metrics */}
      <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-slate-500 block text-[10px] uppercase font-mono tracking-wider font-semibold">Bloch Vector (X, Y, Z)</span>
          <span className="font-mono font-bold text-[#0f62fe] text-xs">
            ({displayX.toFixed(2)}, {displayY.toFixed(2)}, {displayZ.toFixed(2)})
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-slate-500 block text-[10px] uppercase font-mono tracking-wider font-semibold">Probabilities |0⟩ / |1⟩</span>
          <span className="font-mono font-bold text-slate-800 text-xs">
            {(Math.cos(activeTheta / 2) ** 2 * 100).toFixed(0)}% / {(Math.sin(activeTheta / 2) ** 2 * 100).toFixed(0)}%
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-center">
          <span className="text-slate-500 block text-[10px] uppercase font-mono tracking-wider font-semibold">Purity</span>
          <span className="font-mono font-bold text-emerald-600 text-xs flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {currentCoords.pure || isManualOverride ? 'Pure State' : 'Entangled (Mixed)'}
          </span>
        </div>
      </div>
    </div>
  );
};
