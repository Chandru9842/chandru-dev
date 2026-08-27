import React, { useRef, useEffect, useState, Suspense, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sparkles, Stars, Float, Html } from '@react-three/drei';
import * as THREE from 'three';

// --- PROCEDURAL TEXTURE GENERATORS ---
// These run purely in the client, requiring zero asset requests or network bandwidth!

// 1. Procedural Planet Earth texture
function createEarthCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Ocean Base Gradient
  const grad = ctx.createLinearGradient(0, 0, 1024, 512);
  grad.addColorStop(0, '#020617');
  grad.addColorStop(0.5, '#050b18');
  grad.addColorStop(1, '#09152e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 512);

  // Drawing procedural glowing landmasses (continent silhouettes)
  ctx.fillStyle = 'rgba(16, 185, 129, 0.85)'; // Emerald Green Land
  ctx.shadowColor = '#10b981';
  ctx.shadowBlur = 15;

  // Americas
  ctx.beginPath();
  ctx.ellipse(320, 240, 75, 130, 0.1, 0, Math.PI * 2);
  ctx.ellipse(260, 150, 95, 75, -0.1, 0, Math.PI * 2);
  ctx.ellipse(360, 360, 45, 95, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Africa / Europe
  ctx.beginPath();
  ctx.ellipse(540, 260, 85, 105, -0.15, 0, Math.PI * 2);
  ctx.ellipse(530, 130, 95, 65, 0.1, 0, Math.PI * 2);
  ctx.ellipse(510, 80, 50, 40, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eurasia / Oceania / India
  ctx.beginPath();
  ctx.ellipse(780, 160, 150, 90, 0.05, 0, Math.PI * 2);
  ctx.ellipse(820, 240, 60, 50, -0.2, 0, Math.PI * 2);
  ctx.ellipse(740, 230, 45, 55, 0.1, 0, Math.PI * 2);
  // Australia
  ctx.ellipse(850, 370, 65, 45, 0.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0; // Reset shadow

  // City Lights (Glow points inside landmasses)
  ctx.fillStyle = '#6ee7b7';
  const fullImgData = ctx.getImageData(0, 0, 1024, 512).data;
  for (let i = 0; i < 200; i++) {
    const x = Math.floor(Math.random() * 1024);
    const y = Math.floor(Math.random() * 512);
    const offset = (y * 1024 + x) * 4;
    if (fullImgData[offset + 1] > 100 && fullImgData[offset] < 100) { // Green continent mask
      ctx.beginPath();
      ctx.arc(x, y, 0.8 + Math.random() * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Draw cyber latitude/longitude lines on top for a futuristic look
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.25)';
  ctx.lineWidth = 0.5;
  for (let i = 0; i < 1024; i += 64) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 512);
    ctx.stroke();
  }
  for (let j = 0; j < 512; j += 48) {
    ctx.beginPath();
    ctx.moveTo(0, j);
    ctx.lineTo(1024, j);
    ctx.stroke();
  }

  return canvas;
}

// 2. Procedural Scrolling Code screen texture for Laptop
class ScrollingCodeTexture {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D | null;
  texture: THREE.CanvasTexture;
  lines: string[] = [];
  yOffsets: number[] = [];
  maxLines = 22;
  lastUpdate = 0;

  // Code snippets to scroll
  codePool = [
    'import { SpringBoot } from "@nestjs/core";',
    'const db = new MySQLPool({ poolSize: 20 });',
    '@Entity() class SystemCluster extends Base {',
    '  @Column() nodeStatus = "ONLINE";',
    '  @PrimaryColumn() uuid: string;',
    '}',
    'async function syncSchemas(tx: Transaction) {',
    '  await tx.execute("CASCADE CONSTRAINTS");',
    '  logger.info("3NF schema fully satisfied.");',
    '}',
    '// REST Dispatch Thread pool matching...',
    'app.get("/api/analytics", async (req, res) => {',
    '  const views = await db.query("SELECT COUNT(*)...");',
    '  res.status(200).json({ status: "SUCCESS" });',
    '});',
    '// WebGL context binding complete...',
    'const gl = canvas.getContext("webgl2");',
    'gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);',
    'gl.vertexAttribPointer(loc, 3, gl.FLOAT, false);',
    '// Matrix projections mapped: R3F active',
    'camera.position.lerp(mouse, 0.05);',
    'renderer.setPixelRatio(window.devicePixelRatio);'
  ];

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 512;
    this.canvas.height = 512;
    this.ctx = this.canvas.getContext('2d');
    
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.minFilter = THREE.LinearFilter;

    // Seed initial lines
    for (let i = 0; i < this.maxLines; i++) {
      this.lines.push(this.codePool[Math.floor(Math.random() * this.codePool.length)]);
      this.yOffsets.push(24 * (i + 1));
    }
  }

  update() {
    const now = Date.now();
    if (now - this.lastUpdate < 33) return; // Cap texture updates at 30fps
    this.lastUpdate = now;

    if (!this.ctx) return;
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Background
    ctx.fillStyle = '#02040a';
    ctx.fillRect(0, 0, width, height);

    // Glowing Frame
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
    ctx.lineWidth = 6;
    ctx.strokeRect(0, 0, width, height);

    // Grid details
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.03)';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 32) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
    }

    // Scroll lines up
    ctx.font = '15px "JetBrains Mono", monospace';
    ctx.shadowBlur = 4;
    ctx.shadowColor = '#10b981';

    for (let i = 0; i < this.lines.length; i++) {
      ctx.fillStyle = i === this.lines.length - 1 ? '#6ee7b7' : 'rgba(16, 185, 129, 0.8)';
      ctx.fillText(this.lines[i], 24, this.yOffsets[i]);
      this.yOffsets[i] -= 0.8; // Speed of scrolling

      // Recycle line when out of screen top
      if (this.yOffsets[i] < 0) {
        this.lines[i] = this.codePool[Math.floor(Math.random() * this.codePool.length)];
        this.yOffsets[i] = height + 10;
      }
    }
    
    ctx.shadowBlur = 0; // Reset

    // Draw some dynamic server chart at the bottom
    ctx.fillStyle = 'rgba(5, 150, 105, 0.15)';
    ctx.fillRect(24, height - 100, width - 48, 80);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(24, height - 50);
    for (let x = 0; x < width - 48; x += 15) {
      const y = height - 60 + Math.sin(x * 0.05 + Date.now() * 0.003) * 30 * Math.random();
      ctx.lineTo(24 + x, y);
    }
    ctx.stroke();

    ctx.fillStyle = '#6ee7b7';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillText(`CLUSTER HEALTH: 99.8%  |  TPS: ${Math.floor(2500 + Math.random() * 40)}`, 32, height - 30);

    this.texture.needsUpdate = true;
  }
}

// 3. Keyboard Backlight Canvas Texture
function createKeyboardTexture(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.fillStyle = '#090a0f';
  ctx.fillRect(0, 0, 512, 256);

  // Draw trackpad
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(192, 180, 128, 60);
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
  ctx.strokeRect(192, 180, 128, 60);

  // Keyboard grid (Keys)
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.2)';
  ctx.lineWidth = 1;
  const keyRows = 5;
  const keysPerRow = 14;
  const kw = 28;
  const kh = 22;

  for (let r = 0; r < keyRows; r++) {
    for (let k = 0; k < keysPerRow; k++) {
      const ox = 24 + k * (kw + 4) + (r * 4); // staggered
      const oy = 20 + r * (kh + 4);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(ox, oy, kw, kh);
      ctx.strokeRect(ox, oy, kw, kh);
    }
  }

  return canvas;
}


// --- 3D SUB-COMPONENTS ---

// 1. Procedural Planet Earth
function PlanetEarth({ reducedMotion }: { reducedMotion: boolean }) {
  const earthRef = useRef<THREE.Group | null>(null);
  
  // Create and memoize the CanvasTexture so it doesn't leak memory on re-render
  const earthTexture = useMemo(() => {
    const canvas = createEarthCanvas();
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }, []);

  useFrame((state) => {
    if (earthRef.current) {
      if (reducedMotion) {
        earthRef.current.rotation.y = 0.5;
        earthRef.current.position.y = 0;
      } else {
        // Rotation on axis
        earthRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
        // Slight floating wobble
        earthRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.4) * 0.15;
      }
    }
  });

  return (
    <group ref={earthRef} position={[1.25, 0.15, -0.1]}>
      {/* Dynamic Earth Sphere */}
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[1.1, 32, 32]} />
        <meshStandardMaterial
          map={earthTexture}
          roughness={0.4}
          metalness={0.1}
          emissive={new THREE.Color('#10b981')}
          emissiveIntensity={0.08}
        />
      </mesh>

      {/* Atmospheric Outer Glowing Ring */}
      <mesh>
        <sphereGeometry args={[1.15, 16, 16]} />
        <meshBasicMaterial
          color="#10b981"
          transparent
          opacity={0.12}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Cyber Satellite Wireframe orbit ring */}
      <mesh rotation={[Math.PI / 3, 0, Date.now() * 0.0001]}>
        <torusGeometry args={[1.45, 0.012, 6, 32]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.3} />
      </mesh>

      {/* Beaming Satellite Signal Nodes */}
      <mesh position={[1.45, 0, 0]}>
        <sphereGeometry args={[0.05, 4, 4]} />
        <meshBasicMaterial color="#6ee7b7" />
      </mesh>
    </group>
  );
}

// 2. Procedural Holographic Laptop
function HolographicLaptop({ reducedMotion }: { reducedMotion: boolean }) {
  const laptopGroupRef = useRef<THREE.Group | null>(null);
  const screenRef = useRef<THREE.Mesh | null>(null);

  // Initialize scrolling screen class
  const scroller = useMemo(() => new ScrollingCodeTexture(), []);

  // Keyboard layout backlighting
  const keyboardTexture = useMemo(() => {
    const canvas = createKeyboardTexture();
    return new THREE.CanvasTexture(canvas);
  }, []);

  useFrame((state) => {
    // Update real-time scrolling code texture
    if (!reducedMotion) {
      scroller.update();
    }

    if (laptopGroupRef.current) {
      if (reducedMotion) {
        laptopGroupRef.current.position.y = -0.2;
        laptopGroupRef.current.rotation.y = -0.5;
      } else {
        // Gentle floating animation
        laptopGroupRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.55) * 0.2 - 0.2;
        // Soft ambient sway
        laptopGroupRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.25) * 0.15 - 0.5;
      }
    }
  });

  return (
    <group ref={laptopGroupRef} position={[-1.25, -0.2, 0.2]} scale={0.58}>
      
      {/* LAPTOP KEYBOARD BASE */}
      <mesh castShadow receiveShadow position={[0, -0.05, 0]}>
        <boxGeometry args={[4.2, 0.1, 3.0]} />
        <meshStandardMaterial 
          color="#0f172a" 
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Key board surface with procedural key glow texture */}
      <mesh position={[0, 0.01, -0.1]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.8, 2.5]} />
        <meshStandardMaterial
          map={keyboardTexture}
          roughness={0.5}
          metalness={0.3}
          emissive={new THREE.Color('#10b981')}
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* LAPTOP HINGE CYLINDER */}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0.04, -1.45]}>
        <cylinderGeometry args={[0.07, 0.07, 4.0, 16]} />
        <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* LAPTOP SCREEN/LID (Angled open by ~115 degrees) */}
      <group position={[0, 0.04, -1.45]} rotation={[1.1, 0, 0]}>
        
        {/* Screen back casing */}
        <mesh castShadow position={[0, 1.35, -0.04]}>
          <boxGeometry args={[4.2, 2.7, 0.08]} />
          <meshStandardMaterial 
            color="#090d16" 
            roughness={0.3} 
            metalness={0.9} 
          />
        </mesh>

        {/* Glossy bezel front panel */}
        <mesh position={[0, 1.35, 0.005]}>
          <boxGeometry args={[4.05, 2.55, 0.01]} />
          <meshBasicMaterial color="#020408" />
        </mesh>

        {/* Actual Glowing Code Screen Matrix Panel */}
        <mesh ref={screenRef} position={[0, 1.35, 0.015]}>
          <planeGeometry args={[3.9, 2.4]} />
          <meshBasicMaterial 
            map={scroller.texture} 
            transparent 
            opacity={0.95}
          />
        </mesh>

        {/* Laser Screen Emissive Glow Effect */}
        <pointLight 
          position={[0, 1.35, 0.3]} 
          distance={4} 
          intensity={0.6} 
          color="#10b981" 
        />
      </group>

      {/* High-tech Holographic Rings floating above keyboard */}
      <mesh position={[0, 0.5, -0.1]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.2, 0.015, 8, 32]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.15} />
      </mesh>
      <mesh position={[0, 0.7, -0.1]} rotation={[Math.PI / 2, 0.1, 0]}>
        <torusGeometry args={[0.9, 0.01, 8, 32]} />
        <meshBasicMaterial color="#6ee7b7" transparent opacity={0.25} />
      </mesh>

    </group>
  );
}

// 3. Glowing Particle Galaxy (Spiral Star Arms)
function ParticleGalaxy({ reducedMotion }: { reducedMotion: boolean }) {
  const pointsRef = useRef<THREE.Points | null>(null);

  // Generate spiral galaxy coordinates
  const [positions, colors] = useMemo(() => {
    const count = 1800;
    const pos = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);

    const colorInside = new THREE.Color('#10b981'); // Emerald
    const colorMiddle = new THREE.Color('#6ee7b7'); // Light Emerald
    const colorOutside = new THREE.Color('#3b0764'); // Deep Purple nebula edge

    for (let i = 0; i < count; i++) {
      // Spiral Math
      const r = Math.pow(Math.random(), 2.2) * 16;
      const spin = 1.4;
      const branches = 2;
      const branchAngle = ((i % branches) / branches) * Math.PI * 2;
      const spiralAngle = r * spin + branchAngle;

      // Random dispersion spread
      const randomX = (Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.4) * r;
      const randomY = (Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.4) * r;
      const randomZ = (Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.4) * r;

      const x = Math.cos(spiralAngle) * r + randomX;
      const y = randomY;
      const z = Math.sin(spiralAngle) * r + randomZ;

      pos[i * 3] = x;
      pos[i * 3 + 1] = y - 1.5; // lower galaxy slightly
      pos[i * 3 + 2] = z;

      // Color Interpolation based on distance
      const mixedColor = colorInside.clone();
      if (r < 4) {
        mixedColor.lerp(colorMiddle, r / 4);
      } else {
        mixedColor.lerp(colorOutside, (r - 4) / 12);
      }

      cols[i * 3] = mixedColor.r;
      cols[i * 3 + 1] = mixedColor.g;
      cols[i * 3 + 2] = mixedColor.b;
    }

    return [pos, cols];
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      if (reducedMotion) {
        pointsRef.current.rotation.y = 0.2;
      } else {
        // Spin the entire galaxy
        pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.025;
      }
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.065}
        sizeAttenuation={true}
        depthWrite={false}
        vertexColors
        transparent
        opacity={0.65}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// 4. Camera Parallax Mouse controller
function CameraMouseController({ reducedMotion }: { reducedMotion: boolean }) {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (reducedMotion) return;
    const handleMouseMove = (event: MouseEvent) => {
      // Normalize mouse coordinates (-1 to +1)
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [reducedMotion]);

  useFrame(() => {
    if (reducedMotion) {
      camera.position.x = 0;
      camera.position.y = 0;
      camera.lookAt(0, 0, 0);
      return;
    }
    // Smooth camera target lerp based on mouse position (Parallax effect)
    const targetX = mouse.current.x * 0.5;
    const targetY = mouse.current.y * 0.3;
    
    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (targetY - camera.position.y) * 0.05;
    
    // Always look towards scene center
    camera.lookAt(0, 0, 0);
  });

  return null;
}


// Responsive Scene Container to scale composition based on canvas aspect ratio
function ResponsiveSceneContainer({ children }: { children: React.ReactNode }) {
  const { size } = useThree();
  const aspect = size.width / (size.height || 1);

  const scale = useMemo(() => {
    if (aspect < 0.75) return 0.62;
    if (aspect < 0.95) return 0.72;
    if (aspect < 1.25) return 0.82;
    if (aspect < 1.5) return 0.90;
    return 0.95;
  }, [aspect]);

  return (
    <group scale={[scale, scale, scale]} position={[0, -0.05, 0]}>
      {children}
    </group>
  );
}

// --- MAIN 3D HERO CANVAS CONTAINER ---

export default function ThreeDHero({ techString }: { techString?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(true);
  const [isTabVisible, setIsTabVisible] = useState(() => typeof document !== 'undefined' ? !document.hidden : true);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const [isLowBattery, setIsLowBattery] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // 1. Viewport Intersection Observer (freeze when scrolled out of view)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  // 2. Tab Visibility Observer (freeze when user switches tabs to save 100% background GPU)
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // 3. Battery Saver & Low-Power Hardware Awareness
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any).getBattery?.().then((battery: any) => {
        const checkBattery = () => {
          if (battery.level < 0.2 && !battery.charging) {
            setIsLowBattery(true);
          } else {
            setIsLowBattery(false);
          }
        };
        checkBattery();
        battery.addEventListener?.('levelchange', checkBattery);
        battery.addEventListener?.('chargingchange', checkBattery);
      }).catch(() => {});
    }
  }, []);

  // 4. Reduced Motion Preferences
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const shouldRender = isInView && isTabVisible && !isManuallyPaused;
  const frameloopMode = shouldRender ? (reducedMotion || isLowBattery ? "demand" : "always") : "never";

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-auto" style={{ minHeight: '100%' }}>
      
      {/* Interactive WebGL Engine HUD Status Control */}
      <div className="absolute top-4 right-4 z-20 pointer-events-auto hidden sm:block">
        <button
          type="button"
          onClick={() => setIsManuallyPaused(prev => !prev)}
          className={`px-3 py-1.5 rounded-full border text-[10px] font-mono flex items-center gap-2 backdrop-blur-md transition-all shadow-lg cursor-pointer select-none ${
            isManuallyPaused || !shouldRender
              ? 'bg-slate-900/90 border-slate-700/80 text-slate-400 hover:text-slate-200'
              : 'bg-slate-950/80 border-emerald-500/30 text-emerald-400 hover:border-emerald-400'
          }`}
          title={isManuallyPaused ? "Resume 3D Engine" : "Pause 3D WebGL Engine to save power"}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${shouldRender ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <span className="font-bold">WebGL {shouldRender ? (isMobile ? '30FPS' : '60FPS') : 'PAUSED'}</span>
          <span className="text-[9px] uppercase text-slate-500 font-semibold">
            [{isManuallyPaused ? 'Play ▶' : 'Pause ⏸'}]
          </span>
        </button>
      </div>

      {/* High Performance Suspense Lazy loader fallback wrapper */}
      <Suspense fallback={
        <div className="absolute inset-0 flex items-center justify-center bg-[#030712] z-50">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
              Booting WebGL 3D Shell...
            </span>
          </div>
        </div>
      }>
        <Canvas
          dpr={isMobile || isLowBattery ? [1, 1] : [1, 1.25]}
          frameloop={frameloopMode}
          shadows={!isMobile && !isLowBattery}
          camera={{ position: [0, 0, 7.2], fov: 46 }}
          gl={{ antialias: !isMobile && !isLowBattery, powerPreference: isLowBattery ? "low-power" : "high-performance" }}
          style={{ width: '100%', height: '100%', display: 'block' }}
          id="react-three-fiber-universe"
        >
          {/* Ambient space background styling */}
          <fog attach="fog" args={['#030712', 4, 18]} />

          {/* Dynamic Interactive lighting */}
          <ambientLight intensity={0.12} />
          
          {/* Main spotlight on planet and laptop */}
          <directionalLight
            castShadow={!isMobile && !isLowBattery}
            position={[4, 5, 3]}
            intensity={1.2}
            color="#d1fae5"
            shadow-mapSize={isMobile || isLowBattery ? [256, 256] : [512, 512]}
          />

          {/* Deep celestial ambient purple side fill */}
          <pointLight position={[-6, -4, -2]} intensity={0.5} color="#4c1d95" />

          {/* Moving orbit lighting glow */}
          <pointLight position={[0, 4, 2]} intensity={0.8} color="#10b981" />

          {/* Starfield galaxy background */}
          <Stars radius={80} depth={50} count={isMobile || isLowBattery ? 100 : 380} factor={4} saturation={0.5} fade speed={1} />
          
          {/* Secondary smaller dust particle swarm */}
          <Sparkles count={isMobile || isLowBattery ? 15 : 40} scale={8} size={2.5} speed={0.4} color="#6ee7b7" />

          {/* Major components wrapped in Responsive Scene Container */}
          <ResponsiveSceneContainer>
            <ParticleGalaxy reducedMotion={reducedMotion || isLowBattery} />
            <PlanetEarth reducedMotion={reducedMotion || isLowBattery} />
            <HolographicLaptop reducedMotion={reducedMotion || isLowBattery} />

            {/* High-tech HTML floating telemetry display (Responsive billboard) */}
            <Float speed={reducedMotion || isLowBattery ? 0 : 1.8} rotationIntensity={reducedMotion ? 0 : 0.2} floatIntensity={reducedMotion ? 0 : 0.5}>
              <Html
                position={[0, 2.0, 0]}
                center
                distanceFactor={8}
                className="pointer-events-none"
              >
                <div className="flex glass-card border border-emerald-500/20 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl items-center gap-2 sm:gap-3 whitespace-nowrap opacity-90 select-none shadow-xl shadow-emerald-950/25">
                  <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <div className="font-mono text-[8px] sm:text-[9px] uppercase tracking-wider text-slate-300">
                    <span className="text-emerald-400 font-bold">{techString || "JAVA • SPRING BOOT • REACT • MYSQL"}</span>
                  </div>
                </div>
              </Html>
            </Float>
          </ResponsiveSceneContainer>

          {/* Mouse Parallax Tracking Camera Control */}
          <CameraMouseController reducedMotion={reducedMotion || isLowBattery} />

        </Canvas>
      </Suspense>
    </div>
  );
}
