"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface Anomaly {
  id: number;
  position: THREE.Vector3;
  mesh: THREE.Mesh;
  radius: number;
  maxRadius: number;
  intensity: number;
  life: number; // 1.0 to 0.0
}

interface Packet {
  mesh: THREE.Mesh;
  pathIndex: number;
  t: number;
  speed: number;
  velocity: THREE.Vector3;
  originalPos: THREE.Vector3;
  deflected: boolean;
}

export function AntiGravityViz() {
  const mountRef = useRef<HTMLDivElement>(null);

  // HUD States
  const [anomalyCount, setAnomalyCount] = useState(0);
  const [reroutedCount, setReroutedCount] = useState(0);
  const [packetRate, setPacketRate] = useState(1420);
  const [resilienceScore, setResilienceScore] = useState(100);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const anomaliesRef = useRef<Anomaly[]>([]);
  const reroutedCounterRef = useRef<number>(0);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // --- 1. THREE.JS SCENE SETUP ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070a12);
    scene.fog = new THREE.FogExp2(0x070a12, 0.025);

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.set(0, 4, 16);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // --- 2. LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0x1a2238, 1.5);
    scene.add(ambientLight);

    const vercelPointLight = new THREE.PointLight(0x00f0ff, 3, 20);
    vercelPointLight.position.set(-6, 2, 0);
    scene.add(vercelPointLight);

    const supabasePointLight = new THREE.PointLight(0x00e676, 3, 20);
    supabasePointLight.position.set(6, 2, 0);
    scene.add(supabasePointLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 12, 8);
    scene.add(dirLight);

    // --- 3. BACKGROUND & FLOATING RACKS ---
    // Volumetric Grid
    const gridHelper = new THREE.GridHelper(40, 40, 0x00f0ff, 0x1e293b);
    gridHelper.position.y = -5;
    scene.add(gridHelper);

    // Ambient Floating Particles (Zero Gravity Dust)
    const particleCount = 400;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 40;
      particlePositions[i + 1] = (Math.random() - 0.5) * 30;
      particlePositions[i + 2] = (Math.random() - 0.5) * 40;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x64748b,
      size: 0.08,
      transparent: true,
      opacity: 0.6,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // Floating Server Racks around perimeter
    const rackGroup = new THREE.Group();
    const rackGeo = new THREE.BoxGeometry(1.2, 4, 1.2);
    const rackMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.3,
      metalness: 0.8,
    });

    const rackPositions = [
      [-10, 0, -8],
      [10, 0, -8],
      [-12, 1, 4],
      [12, 1, 4],
      [-4, 3, -12],
      [4, 3, -12],
    ];

    rackPositions.forEach(([x, y, z]) => {
      const rack = new THREE.Mesh(rackGeo, rackMat);
      rack.position.set(x, y, z);
      rackGroup.add(rack);

      // Blinking status lights on racks
      const lightGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
      const lightMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
      for (let i = 0; i < 4; i++) {
        const lightMesh = new THREE.Mesh(lightGeo, lightMat);
        lightMesh.position.set(x + 0.61, y - 1 + i * 0.7, z);
        rackGroup.add(lightMesh);
      }
    });
    scene.add(rackGroup);

    // --- 4. CENTRAL NODES ---
    // A. Vercel Node (Edge Compute)
    const vercelGroup = new THREE.Group();
    vercelGroup.position.set(-6, 1, 0);

    const vercelCoreGeo = new THREE.OctahedronGeometry(1.2, 0);
    const vercelCoreMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x0099ff,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      wireframe: false,
    });
    const vercelMesh = new THREE.Mesh(vercelCoreGeo, vercelCoreMat);
    vercelGroup.add(vercelMesh);

    // Vercel Wireframe Shell
    const vercelShellGeo = new THREE.OctahedronGeometry(1.6, 1);
    const vercelShellMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    });
    const vercelShell = new THREE.Mesh(vercelShellGeo, vercelShellMat);
    vercelGroup.add(vercelShell);
    scene.add(vercelGroup);

    // B. Supabase Core (Shielded DB)
    const supabaseGroup = new THREE.Group();
    supabaseGroup.position.set(6, 1, 0);

    const supabaseCoreGeo = new THREE.SphereGeometry(1.1, 32, 32);
    const supabaseCoreMat = new THREE.MeshStandardMaterial({
      color: 0x00e676,
      emissive: 0x00b0ff,
      emissiveIntensity: 0.7,
      roughness: 0.1,
    });
    const supabaseMesh = new THREE.Mesh(supabaseCoreGeo, supabaseCoreMat);
    supabaseGroup.add(supabaseMesh);

    // Forcefield Shield Rings
    const ringGeo = new THREE.TorusGeometry(1.7, 0.04, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00e676, transparent: true, opacity: 0.7 });

    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    const ring2 = new THREE.Mesh(ringGeo, ringMat);
    ring2.rotation.x = Math.PI / 2;
    supabaseGroup.add(ring1);
    supabaseGroup.add(ring2);
    scene.add(supabaseGroup);

    // C. Satellite Nodes (Stripe & Resend)
    const stripeGroup = new THREE.Group();
    stripeGroup.position.set(0, 4, -4);
    const stripeMesh = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.8, 0),
      new THREE.MeshStandardMaterial({ color: 0x7a5af8, emissive: 0x4a1fb8, roughness: 0.3 })
    );
    stripeGroup.add(stripeMesh);
    scene.add(stripeGroup);

    const resendGroup = new THREE.Group();
    resendGroup.position.set(0, -3, 3);
    const resendMesh = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.7, 0),
      new THREE.MeshStandardMaterial({ color: 0xff9800, emissive: 0xe65100, roughness: 0.3 })
    );
    resendGroup.add(resendMesh);
    scene.add(resendGroup);

    // --- 5. CONDUITS & DYNAMIC PATHS ---
    // Primary path: Direct curve between Vercel and Supabase
    const primaryCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-6, 1, 0),
      new THREE.Vector3(0, 1.5, 0),
      new THREE.Vector3(6, 1, 0)
    );

    // Backup Path 1: Top Arc via Stripe Node
    const backupCurveTop = new THREE.CubicBezierCurve3(
      new THREE.Vector3(-6, 1, 0),
      new THREE.Vector3(-3, 4.5, -3),
      new THREE.Vector3(3, 4.5, -3),
      new THREE.Vector3(6, 1, 0)
    );

    // Backup Path 2: Bottom Arc via Resend Node
    const backupCurveBottom = new THREE.CubicBezierCurve3(
      new THREE.Vector3(-6, 1, 0),
      new THREE.Vector3(-3, -2.5, 2.5),
      new THREE.Vector3(3, -2.5, 2.5),
      new THREE.Vector3(6, 1, 0)
    );

    const curves = [primaryCurve, backupCurveTop, backupCurveBottom];

    // Render conduit tubes
    curves.forEach((curve, index) => {
      const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.08, 8, false);
      const tubeMat = new THREE.MeshBasicMaterial({
        color: index === 0 ? 0x00f0ff : 0x3b82f6,
        transparent: true,
        opacity: index === 0 ? 0.4 : 0.25,
        wireframe: true,
      });
      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
      scene.add(tubeMesh);
    });

    // --- 6. DATA PACKETS SYSTEM ---
    const packetGroup = new THREE.Group();
    scene.add(packetGroup);

    const packets: Packet[] = [];
    const packetGeo = new THREE.SphereGeometry(0.16, 16, 16);
    const packetMatPrimary = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 1.5,
    });
    const packetMatRerouted = new THREE.MeshStandardMaterial({
      color: 0xff007f,
      emissive: 0xff007f,
      emissiveIntensity: 1.5,
    });

    for (let i = 0; i < 45; i++) {
      const isAlt = i % 3 !== 0;
      const pathIdx = isAlt ? (i % 2 === 0 ? 1 : 2) : 0;
      const mesh = new THREE.Mesh(packetGeo, isAlt ? packetMatRerouted : packetMatPrimary);

      const t = Math.random();
      const pos = curves[pathIdx].getPoint(t);
      mesh.position.copy(pos);
      packetGroup.add(mesh);

      packets.push({
        mesh,
        pathIndex: pathIdx,
        t,
        speed: 0.003 + Math.random() * 0.003,
        velocity: new THREE.Vector3(0, 0, 0),
        originalPos: pos.clone(),
        deflected: false,
      });
    }

    // --- 7. MOUSE CLICK ANTI-GRAVITY ANOMALY SPAWNER ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const spawnAnomalyAtClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      // Create an invisible plane at z=0 to intersect click point in 3D
      const targetPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      const intersectionPoint = new THREE.Vector3();
      raycaster.ray.intersectPlane(targetPlane, intersectionPoint);

      if (!intersectionPoint) return;

      // Create glowing Anomaly Mesh
      const anomalyGeo = new THREE.SphereGeometry(0.3, 32, 32);
      const anomalyMat = new THREE.MeshBasicMaterial({
        color: 0xff007f,
        wireframe: true,
        transparent: true,
        opacity: 0.8,
      });
      const anomalyMesh = new THREE.Mesh(anomalyGeo, anomalyMat);
      anomalyMesh.position.copy(intersectionPoint);
      scene.add(anomalyMesh);

      const newAnomaly: Anomaly = {
        id: Date.now() + Math.random(),
        position: intersectionPoint.clone(),
        mesh: anomalyMesh,
        radius: 0.3,
        maxRadius: 3.5,
        intensity: 1.0,
        life: 1.0,
      };

      anomaliesRef.current.push(newAnomaly);
      setAnomalyCount(anomaliesRef.current.length);
    };

    const handleClick = (e: MouseEvent) => {
      spawnAnomalyAtClick(e);
    };

    container.addEventListener("click", handleClick);

    // --- 8. ANIMATION LOOP & PHYSICS ENGINE ---
    let clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Idle Rotation of Nodes
      vercelGroup.rotation.y = time * 0.6;
      vercelGroup.position.y = 1 + Math.sin(time * 2) * 0.2;

      supabaseMesh.rotation.y = time * 0.4;
      ring1.rotation.z = time * 0.8;
      ring2.rotation.y = time * 0.8;
      supabaseGroup.position.y = 1 + Math.cos(time * 2) * 0.2;

      stripeGroup.rotation.x = time * 0.5;
      stripeGroup.rotation.y = time * 0.5;

      resendGroup.rotation.y = time * 0.7;

      particleSystem.rotation.y = time * 0.03;

      // Update Anti-Gravity Anomalies
      const activeAnomalies = anomaliesRef.current;
      for (let i = activeAnomalies.length - 1; i >= 0; i--) {
        const a = activeAnomalies[i];
        a.life -= delta * 0.35; // Fades out over ~3 seconds

        if (a.life <= 0) {
          scene.remove(a.mesh);
          activeAnomalies.splice(i, 1);
          setAnomalyCount(activeAnomalies.length);
          continue;
        }

        // Expand wave sphere
        a.radius = THREE.MathUtils.lerp(a.radius, a.maxRadius, 0.05);
        a.mesh.scale.setScalar(a.radius / 0.3);
        (a.mesh.material as THREE.MeshBasicMaterial).opacity = a.life * 0.7;
      }

      // Update Data Packets & Anti-Gravity Physics
      packets.forEach((p) => {
        // Advance along parametric curve
        p.t += p.speed;
        if (p.t > 1) {
          p.t = 0;
          p.deflected = false;
        }

        const targetCurvePos = curves[p.pathIndex].getPoint(p.t);

        // Calculate Repulsion Force from nearby Anti-Gravity Anomalies
        let totalRepulsion = new THREE.Vector3(0, 0, 0);

        activeAnomalies.forEach((a) => {
          const dist = p.mesh.position.distanceTo(a.position);
          if (dist < a.radius) {
            // Apply radial anti-gravity repulsion vector
            const forceDir = p.mesh.position.clone().sub(a.position).normalize();
            const strength = (1 - dist / a.radius) * 3.5 * a.life;
            totalRepulsion.add(forceDir.multiplyScalar(strength));

            if (!p.deflected && p.pathIndex === 0) {
              p.deflected = true;
              // Reroute to top or bottom backup path
              p.pathIndex = Math.random() > 0.5 ? 1 : 2;
              p.mesh.material = packetMatRerouted;

              reroutedCounterRef.current += 1;
              setReroutedCount(reroutedCounterRef.current);
            }
          }
        });

        // Smooth physics position interpolation
        const idealPos = targetCurvePos.add(totalRepulsion);
        p.mesh.position.lerp(idealPos, 0.1);
      });

      // Update Resilience Index based on active anomalies
      if (activeAnomalies.length > 0) {
        setResilienceScore(Math.max(92, 100 - activeAnomalies.length * 2));
      } else {
        setResilienceScore(100);
      }

      // Orbit Camera Lightly
      camera.position.x = Math.sin(time * 0.1) * 2;

      renderer.render(scene, camera);
    };

    animate();

    // --- 9. RESIZE HANDLER ---
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("click", handleClick);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const clearAnomalies = () => {
    anomaliesRef.current = [];
    setAnomalyCount(0);
  };

  return (
    <div className="relative w-full h-[650px] bg-[#070a12] rounded-xl overflow-hidden border border-[#1e293b] shadow-2xl font-sans">
      {/* 3D Canvas Mount */}
      <div ref={mountRef} className="w-full h-full cursor-crosshair" />

      {/* Top HUD Header Banner */}
      <div className="absolute top-4 left-4 right-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0f172a]/80 backdrop-blur-md border border-[#334155] p-4 rounded-lg shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-[#00f0ff] animate-ping" />
          <div>
            <h1 className="text-sm font-bold tracking-wider text-white uppercase flex items-center gap-2">
              <span>Satriano M2O Architecture</span>
              <span className="text-[10px] font-extrabold bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30 px-2 py-0.5 rounded">
                Serverless Anti-Gravity Engine
              </span>
            </h1>
            <p className="text-xs text-[#94a3b8]">
              Click anywhere in 3D space to trigger localized gravity repulsions. Data packets dynamically reroute via backup conduits.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={clearAnomalies}
          className="px-3.5 py-2 bg-[#1e293b] hover:bg-[#334155] text-xs font-semibold text-[#00f0ff] border border-[#00f0ff]/30 rounded-md transition-all shadow-sm cursor-pointer flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Clear Anomalies ({anomalyCount})</span>
        </button>
      </div>

      {/* Telemetry HUD Cards Footer */}
      <div className="absolute bottom-4 left-4 right-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Metric 1: Vercel Edge Node */}
        <div className="bg-[#0f172a]/80 backdrop-blur-md border border-[#334155] p-3 rounded-lg flex items-center gap-3">
          <div className="p-2 bg-[#00f0ff]/10 rounded text-[#00f0ff]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-[#94a3b8]">Vercel Edge Node</div>
            <div className="text-sm font-bold text-white">Active • 12ms</div>
          </div>
        </div>

        {/* Metric 2: Supabase Core */}
        <div className="bg-[#0f172a]/80 backdrop-blur-md border border-[#334155] p-3 rounded-lg flex items-center gap-3">
          <div className="p-2 bg-[#00e676]/10 rounded text-[#00e676]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-[#94a3b8]">Supabase Core</div>
            <div className="text-sm font-bold text-white">Shielded • 100%</div>
          </div>
        </div>

        {/* Metric 3: Dynamic Auto-Reroutes */}
        <div className="bg-[#0f172a]/80 backdrop-blur-md border border-[#334155] p-3 rounded-lg flex items-center gap-3">
          <div className="p-2 bg-[#ff007f]/10 rounded text-[#ff007f]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-[#94a3b8]">Auto-Rerouted</div>
            <div className="text-sm font-bold text-white">{reroutedCount} Packets</div>
          </div>
        </div>

        {/* Metric 4: Serverless Resilience Index */}
        <div className="bg-[#0f172a]/80 backdrop-blur-md border border-[#334155] p-3 rounded-lg flex items-center gap-3">
          <div className="p-2 bg-[#3b82f6]/10 rounded text-[#3b82f6]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-[#94a3b8]">Resilience Score</div>
            <div className="text-sm font-bold text-[#00e676]">{resilienceScore}% Operational</div>
          </div>
        </div>
      </div>
    </div>
  );
}
