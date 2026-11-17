import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  Zap,
  Play,
  Pause,
  Activity,
  Database,
  ShieldCheck,
  Server,
  Layers,
  Sparkles,
  Cpu,
} from 'lucide-react';
import { soundFx } from '../utils/soundEffects';

export interface ThreeDHeroProps {
  techString?: string;
}

type ShowcaseTab = 'core' | 'pipeline' | 'topology';

interface StackNodeSpec {
  id: string;
  name: string;
  fileTitle: string;
  role: string;
  latency: string;
  throughput: string;
  color: string;
  hex: number;
  codeLines: string[];
}

const STACK_NODES: StackNodeSpec[] = [
  {
    id: 'java',
    name: 'Java',
    fileTitle: 'DistributedCoreEngine.java — Spring Boot 3.4',
    role: 'Java 21 LTS Virtual Threads',
    latency: '0.8ms',
    throughput: '22.4k ops/s',
    color: '#10b981',
    hex: 0x10b981,
    codeLines: [
      '@SpringBootApplication @EnableKafka',
      'public class DistributedCoreEngine {',
      '  private final KafkaTemplate<String, Event> bus;',
      '  @Transactional(isolation = SERIALIZABLE)',
      '  public ResponseEntity<ClusterMetrics> dispatch() {',
      '    var node = ClusterNode.builder()',
      '      .region("ap-south-1-bengaluru")',
      '      .virtualThreads(true).build();',
      '    bus.send("telemetry-topic", node.toEvent());',
      '    return ResponseEntity.ok(node.metrics());',
      '  }',
      '}',
    ],
  },
  {
    id: 'spring',
    name: 'Spring Boot',
    fileTitle: 'SystemsGatewayController.java — Reactive Mesh',
    role: 'Spring Boot 3.4 Microservices',
    latency: '1.1ms',
    throughput: '18.9k req/s',
    color: '#34d399',
    hex: 0x34d399,
    codeLines: [
      '@RestController @RequestMapping("/api/v2/core")',
      'public class SystemsGatewayController {',
      '  @CircuitBreaker(name = "cluster", fallbackMethod = "ha")',
      '  @GetMapping("/telemetry/pulse")',
      '  public Mono<TelemetryPayload> streamPulse() {',
      '    return reactiveClusterService',
      '      .verifyRs512Signature()',
      '      .flatMap(ClusterOrchestrator::collectMetrics);',
      '  }',
      '}',
    ],
  },
  {
    id: 'react',
    name: 'React',
    fileTitle: 'SystemsTelemetryHUD.tsx — React 19 + WebGL',
    role: 'React 19 + WebGL 60FPS UI',
    latency: '0.4ms',
    throughput: '60 FPS Lock',
    color: '#06b6d4',
    hex: 0x06b6d4,
    codeLines: [
      'export function SystemsTelemetryHUD() {',
      '  const snapshot = useSyncExternalStore(clusterSub);',
      '  return (',
      '    <PageTransitionWrapper pageKey={snapshot.region}>',
      '      <ThreeDOrbitalReactor rps={snapshot.rps} />',
      '      <RealtimeLatencyGraph p99="0.8ms" />',
      '    </PageTransitionWrapper>',
      '  );',
      '}',
    ],
  },
  {
    id: 'mysql',
    name: 'MySQL',
    fileTitle: 'ProjectRepository.java — MySQL 8.0 + Redis L2',
    role: 'MySQL 8.0 3NF + Redis L2 Cache',
    latency: '0.9ms',
    throughput: '31.2k qps',
    color: '#f59e0b',
    hex: 0xf59e0b,
    codeLines: [
      '@Query("""',
      '  SELECT p FROM Project p',
      '  LEFT JOIN FETCH p.skills s',
      '  WHERE p.isFeatured = true',
      '  ORDER BY p.displayOrder ASC',
      '""")',
      '@Cacheable(value = "featured_projects", key = "\'v2\'")',
      'List<Project> findFeaturedWith3NFJoin();',
    ],
  },
  {
    id: 'docker',
    name: 'Docker',
    fileTitle: 'Dockerfile.prod — Multi-Stage ZGC Runtime',
    role: 'Multi-Stage Distroless Containers',
    latency: '1.0ms',
    throughput: 'Zero-Downtime',
    color: '#38bdf8',
    hex: 0x38bdf8,
    codeLines: [
      'FROM eclipse-temurin:21-jdk-alpine AS build',
      'WORKDIR /workspace',
      'RUN ./mvnw clean package -DskipTests',
      'FROM eclipse-temurin:21-jre-alpine AS prod',
      'COPY --from=build /workspace/target/cms.jar /app.jar',
      'ENTRYPOINT ["java","-XX:+UseZGC","-jar","/app.jar"]',
    ],
  },
  {
    id: 'aws',
    name: 'AWS',
    fileTitle: 'cluster-deployment.yaml — AWS EKS ap-south-1',
    role: 'AWS EKS Multi-AZ Auto-Scaling',
    latency: '9.4ms',
    throughput: '99.99% SLA',
    color: '#a855f7',
    hex: 0xa855f7,
    codeLines: [
      'apiVersion: apps/v1',
      'kind: Deployment',
      'metadata:',
      '  name: chandru-portfolio-cluster',
      '  namespace: ap-south-1-prod',
      'spec:',
      '  replicas: 6',
      '  strategy: { type: RollingUpdate }',
    ],
  },
];

export default function ThreeDHero({ techString }: ThreeDHeroProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [activeTab, setActiveTab] = useState<ShowcaseTab>('core');
  const [activeNodeId, setActiveNodeId] = useState<string>('java');
  const [pulseCount, setPulseCount] = useState<number>(24);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [liveRps, setLiveRps] = useState<number>(14668);
  const [activePipelineStep, setActivePipelineStep] = useState<number>(0);

  const isPausedRef = useRef<boolean>(false);
  const isInViewRef = useRef<boolean>(true);
  const pulseBoostRef = useRef<number>(0);
  const shockwaveRef = useRef<number>(0);
  const activeNodeRef = useRef<string>('java');

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    activeNodeRef.current = activeNodeId;
  }, [activeNodeId]);

  useEffect(() => {
    const el = mountRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]) {
          isInViewRef.current = entries[0].isIntersecting;
        }
      },
      { rootMargin: '150px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const activeNode = useMemo(
    () => STACK_NODES.find((n) => n.id === activeNodeId) || STACK_NODES[0],
    [activeNodeId]
  );

  // Live RPS counter animation (paused when off-screen)
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isPausedRef.current && isInViewRef.current) {
        setLiveRps((prev) => {
          const delta = Math.floor((Math.random() - 0.46) * 185);
          return Math.max(14100, Math.min(19800, prev + delta));
        });
      }
    }, 1400);
    return () => clearInterval(timer);
  }, []);

  // Pipeline tab auto-step
  useEffect(() => {
    if (activeTab !== 'pipeline' || isPaused) return;
    const timer = setInterval(() => {
      if (isInViewRef.current) {
        setActivePipelineStep((s) => (s + 1) % 5);
      }
    }, 1300);
    return () => clearInterval(timer);
  }, [activeTab, isPaused]);

  const handleTriggerPulse = useCallback(() => {
    soundFx.playSuccess();
    pulseBoostRef.current = 2.8;
    shockwaveRef.current = 0.01;
    setPulseCount((c) => c + 1);
    setLiveRps((r) => r + 840);
  }, []);

  const handleSelectStackNode = useCallback((id: string) => {
    soundFx.playClick();
    setActiveNodeId(id);
    pulseBoostRef.current = 1.9;
    shockwaveRef.current = 0.01;
  }, []);

  // ============================================================================
  // 60FPS THREE.JS CYBER GLOBE + HOLOGRAPHIC CODE WORKSTATION (with 3D Fallback)
  // ============================================================================
  useEffect(() => {
    if (activeTab !== 'core') return;
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 560;
    let height = container.clientHeight || 430;

    // --------------------------------------------------------------------------
    // 1. High-DPI Holographic Laptop Screen Texture (1024 x 640)
    // --------------------------------------------------------------------------
    const screenCanvas = document.createElement('canvas');
    screenCanvas.width = 1024;
    screenCanvas.height = 640;
    const sCtx = screenCanvas.getContext('2d');

    const drawLaptopScreen = (scrollTick: number, node: StackNodeSpec) => {
      if (!sCtx) return;

      // Deep cyber-IDE background gradient
      const bgGrad = sCtx.createLinearGradient(0, 0, 0, 640);
      bgGrad.addColorStop(0, '#040b18');
      bgGrad.addColorStop(0.6, '#030813');
      bgGrad.addColorStop(1, '#02060e');
      sCtx.fillStyle = bgGrad;
      sCtx.fillRect(0, 0, 1024, 640);

      // Subtle holographic grid lines inside screen
      sCtx.strokeStyle = 'rgba(16, 185, 129, 0.055)';
      sCtx.lineWidth = 1;
      for (let y = 68; y < 510; y += 28) {
        sCtx.beginPath();
        sCtx.moveTo(0, y);
        sCtx.lineTo(1024, y);
        sCtx.stroke();
      }
      for (let x = 80; x < 1024; x += 64) {
        sCtx.beginPath();
        sCtx.moveTo(x, 68);
        sCtx.lineTo(x, 510);
        sCtx.stroke();
      }

      // Top macOS / JetBrains Studio Header Bar
      const hdrGrad = sCtx.createLinearGradient(0, 0, 1024, 0);
      hdrGrad.addColorStop(0, '#071426');
      hdrGrad.addColorStop(0.5, '#0a1c34');
      hdrGrad.addColorStop(1, '#071426');
      sCtx.fillStyle = hdrGrad;
      sCtx.fillRect(0, 0, 1024, 64);

      sCtx.strokeStyle = 'rgba(52, 211, 153, 0.35)';
      sCtx.lineWidth = 2;
      sCtx.beginPath();
      sCtx.moveTo(0, 64);
      sCtx.lineTo(1024, 64);
      sCtx.stroke();

      // Traffic light dots
      const dots = ['#ff5f56', '#ffbd2e', '#27c93f'];
      dots.forEach((c, idx) => {
        sCtx.beginPath();
        sCtx.arc(34 + idx * 28, 32, 9, 0, Math.PI * 2);
        sCtx.fillStyle = c;
        sCtx.fill();
      });

      // File title & Live JVM badge
      sCtx.font = 'bold 21px "JetBrains Mono", monospace';
      sCtx.fillStyle = '#34d399';
      sCtx.fillText(node.fileTitle, 132, 39);

      // Right pill in header
      sCtx.fillStyle = 'rgba(16, 185, 129, 0.16)';
      sCtx.strokeStyle = 'rgba(52, 211, 153, 0.45)';
      sCtx.lineWidth = 1.5;
      sCtx.beginPath();
      sCtx.roundRect(790, 14, 210, 36, 10);
      sCtx.fill();
      sCtx.stroke();

      sCtx.font = 'bold 17px monospace';
      sCtx.fillStyle = '#6ee7b7';
      sCtx.fillText(`● ${node.latency} | ${node.name.toUpperCase()}`, 812, 38);

      // Scrolling Live Production Code
      const lines = node.codeLines;
      const lineHeight = 38;
      const totalHeight = lines.length * lineHeight;
      const offset = (scrollTick * 42) % totalHeight;

      sCtx.save();
      sCtx.beginPath();
      sCtx.rect(0, 66, 1024, 442);
      sCtx.clip();

      // Active execution highlight bar (oscillating smoothly)
      const activeCursorY = 330 + Math.sin(scrollTick * 2.2) * 36;
      const barGrad = sCtx.createLinearGradient(0, activeCursorY - 18, 920, activeCursorY - 18);
      barGrad.addColorStop(0, 'rgba(245, 158, 11, 0.24)');
      barGrad.addColorStop(0.5, 'rgba(16, 185, 129, 0.12)');
      barGrad.addColorStop(1, 'rgba(16, 185, 129, 0)');
      sCtx.fillStyle = barGrad;
      sCtx.fillRect(0, activeCursorY - 24, 1024, 36);

      // Golden execution pointer arrow on active line
      sCtx.strokeStyle = '#fbbf24';
      sCtx.fillStyle = '#fbbf24';
      sCtx.lineWidth = 3;
      sCtx.beginPath();
      sCtx.moveTo(76, activeCursorY - 6);
      sCtx.lineTo(136, activeCursorY - 6);
      sCtx.stroke();
      sCtx.beginPath();
      sCtx.moveTo(142, activeCursorY - 6);
      sCtx.lineTo(130, activeCursorY - 13);
      sCtx.lineTo(130, activeCursorY + 1);
      sCtx.closePath();
      sCtx.fill();

      for (let pass = 0; pass < 2; pass++) {
        lines.forEach((line, idx) => {
          const y = 104 + idx * lineHeight - offset + pass * totalHeight;
          if (y < 64 || y > 520) return;

          // Line numbers
          sCtx.font = '20px monospace';
          sCtx.fillStyle = '#475569';
          sCtx.fillText(String(idx + 1).padStart(2, '0'), 24, y);

          // Code syntax coloring
          sCtx.font = 'bold 23px "JetBrains Mono", monospace';
          const trimmed = line.trim();
          if (trimmed.startsWith('@')) {
            sCtx.fillStyle = '#34d399';
          } else if (
            line.includes('public') ||
            line.includes('private') ||
            line.includes('return') ||
            line.includes('export') ||
            line.includes('FROM') ||
            line.includes('apiVersion')
          ) {
            sCtx.fillStyle = '#38bdf8';
          } else if (line.includes('"') || line.includes("'")) {
            sCtx.fillStyle = '#fbbf24';
          } else {
            sCtx.fillStyle = '#f1f5f9';
          }
          sCtx.fillText(line, 82, y);
        });
      }
      sCtx.restore();

      // Bottom Live Oscilloscope & Telemetry Deck inside Laptop Screen
      sCtx.fillStyle = '#040d1a';
      sCtx.fillRect(0, 508, 1024, 132);

      sCtx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
      sCtx.lineWidth = 2;
      sCtx.beginPath();
      sCtx.moveTo(0, 508);
      sCtx.lineTo(1024, 508);
      sCtx.stroke();

      // Primary Emerald Sine Waveform + Fill
      sCtx.beginPath();
      for (let x = 24; x <= 720; x += 8) {
        const wy =
          574 +
          Math.sin(x * 0.025 + scrollTick * 5.0) * 24 +
          Math.cos(x * 0.055 - scrollTick * 3.2) * 12;
        if (x === 24) sCtx.moveTo(x, wy);
        else sCtx.lineTo(x, wy);
      }
      sCtx.strokeStyle = '#10b981';
      sCtx.lineWidth = 4;
      sCtx.stroke();

      // Secondary Cyan Harmonic Waveform
      sCtx.beginPath();
      for (let x = 24; x <= 720; x += 8) {
        const wy =
          580 +
          Math.cos(x * 0.03 - scrollTick * 4.2) * 16 +
          Math.sin(x * 0.07 + scrollTick * 2.5) * 9;
        if (x === 24) sCtx.moveTo(x, wy);
        else sCtx.lineTo(x, wy);
      }
      sCtx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
      sCtx.lineWidth = 2.5;
      sCtx.stroke();

      // Right mini telemetry readout on laptop screen
      sCtx.font = 'bold 18px monospace';
      sCtx.fillStyle = '#94a3b8';
      sCtx.fillText('THROUGHPUT', 760, 548);
      sCtx.font = 'bold 26px monospace';
      sCtx.fillStyle = '#34d399';
      sCtx.fillText(node.throughput, 760, 582);
      sCtx.font = '16px monospace';
      sCtx.fillStyle = '#38bdf8';
      sCtx.fillText('STATUS: OPTIMAL 99.99%', 760, 612);

      // Glowing outer screen frame
      sCtx.strokeStyle = 'rgba(52, 211, 153, 0.65)';
      sCtx.lineWidth = 4;
      sCtx.strokeRect(2, 2, 1020, 636);
    };

    // --------------------------------------------------------------------------
    // 2. High-Craft 3D Backlit Keyboard & Trackpad Deck Texture (512 x 320)
    // --------------------------------------------------------------------------
    const keyboardCanvas = document.createElement('canvas');
    keyboardCanvas.width = 512;
    keyboardCanvas.height = 320;
    const kCtx = keyboardCanvas.getContext('2d');
    if (kCtx) {
      const deckGrad = kCtx.createLinearGradient(0, 0, 512, 320);
      deckGrad.addColorStop(0, '#0a1929');
      deckGrad.addColorStop(0.5, '#0f293a');
      deckGrad.addColorStop(1, '#071422');
      kCtx.fillStyle = deckGrad;
      kCtx.fillRect(0, 0, 512, 320);

      // Metallic chamfered perimeter border
      kCtx.strokeStyle = 'rgba(52, 211, 153, 0.45)';
      kCtx.lineWidth = 3;
      kCtx.strokeRect(4, 4, 504, 312);

      // Recessed keyboard well
      kCtx.fillStyle = '#040b14';
      kCtx.beginPath();
      kCtx.roundRect(26, 22, 460, 178, 8);
      kCtx.fill();
      kCtx.strokeStyle = 'rgba(16, 185, 129, 0.25)';
      kCtx.lineWidth = 1.5;
      kCtx.stroke();

      // 6 rows of backlit mechanical keycaps
      const rows = 6;
      const cols = 14;
      const startX = 36;
      const startY = 30;
      const keyW = 29;
      const keyH = 23;
      const gapX = 3.2;
      const gapY = 4.5;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          // Spacebar row special handling
          if (r === 5 && c >= 4 && c <= 9) {
            if (c === 4) {
              const sbW = keyW * 6 + gapX * 5;
              kCtx.fillStyle = '#0c1c2c';
              kCtx.strokeStyle = 'rgba(52, 211, 153, 0.55)';
              kCtx.lineWidth = 1.2;
              kCtx.beginPath();
              kCtx.roundRect(startX + c * (keyW + gapX), startY + r * (keyH + gapY), sbW, keyH, 4);
              kCtx.fill();
              kCtx.stroke();
            }
            continue;
          }
          const kx = startX + c * (keyW + gapX);
          const ky = startY + r * (keyH + gapY);
          kCtx.fillStyle = '#0b1827';
          kCtx.strokeStyle =
            (r + c) % 5 === 0 ? 'rgba(56, 189, 248, 0.55)' : 'rgba(16, 185, 129, 0.42)';
          kCtx.lineWidth = 1;
          kCtx.beginPath();
          kCtx.roundRect(kx, ky, keyW, keyH, 3.5);
          kCtx.fill();
          kCtx.stroke();
        }
      }

      // Precision glass haptic trackpad
      kCtx.fillStyle = '#061220';
      kCtx.strokeStyle = 'rgba(52, 211, 153, 0.4)';
      kCtx.lineWidth = 1.5;
      kCtx.beginPath();
      kCtx.roundRect(176, 212, 160, 88, 8);
      kCtx.fill();
      kCtx.stroke();

      // Front lip glowing status LED bar
      kCtx.fillStyle = '#34d399';
      kCtx.fillRect(216, 308, 80, 4);
    }

    // --------------------------------------------------------------------------
    // 3. High-Resolution Cyber-Globe Digital Twin Texture (1024 x 512)
    // --------------------------------------------------------------------------
    const globeCanvas = document.createElement('canvas');
    globeCanvas.width = 1024;
    globeCanvas.height = 512;
    const gCtx = globeCanvas.getContext('2d');
    if (gCtx) {
      // Deep emerald-obsidian planetary core gradient
      const oceanGrad = gCtx.createLinearGradient(0, 0, 0, 512);
      oceanGrad.addColorStop(0, '#021c1e');
      oceanGrad.addColorStop(0.3, '#042f2e');
      oceanGrad.addColorStop(0.5, '#064e3b');
      oceanGrad.addColorStop(0.7, '#042f2e');
      oceanGrad.addColorStop(1, '#02171a');
      gCtx.fillStyle = oceanGrad;
      gCtx.fillRect(0, 0, 1024, 512);

      // Luminous cyber-continent zones + dot-matrix landmass constellations
      const continentPolys: [number, number, number, number, number][] = [
        // [centerX, centerY, radiusX, radiusY, rotation]
        [210, 165, 115, 78, -0.2], // North America
        [295, 335, 72, 95, 0.25],  // South America
        [515, 145, 88, 56, 0.1],   // Europe
        [535, 285, 82, 92, -0.1],  // Africa
        [715, 175, 145, 86, 0.08], // Eurasia & India (AP-SOUTH-1)
        [835, 355, 74, 52, -0.15], // Australia
      ];

      // Soft volumetric continental glow layers
      continentPolys.forEach(([cx, cy, rx, ry, rot]) => {
        gCtx.save();
        gCtx.translate(cx, cy);
        gCtx.rotate(rot);

        const cGrad = gCtx.createRadialGradient(0, 0, 8, 0, 0, Math.max(rx, ry));
        cGrad.addColorStop(0, 'rgba(110, 231, 183, 0.88)');
        cGrad.addColorStop(0.55, 'rgba(16, 185, 129, 0.58)');
        cGrad.addColorStop(0.85, 'rgba(6, 182, 212, 0.22)');
        cGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');

        gCtx.fillStyle = cGrad;
        gCtx.beginPath();
        gCtx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
        gCtx.fill();

        // Crisp continental perimeter contour
        gCtx.strokeStyle = 'rgba(167, 243, 208, 0.55)';
        gCtx.lineWidth = 2;
        gCtx.stroke();
        gCtx.restore();
      });

      // Dot-matrix cyber city nodes across continents
      for (let gx = 16; gx < 1024; gx += 14) {
        for (let gy = 16; gy < 512; gy += 14) {
          let inside = false;
          for (const [cx, cy, rx, ry] of continentPolys) {
            const dx = (gx - cx) / rx;
            const dy = (gy - cy) / ry;
            if (dx * dx + dy * dy <= 0.92) {
              inside = true;
              break;
            }
          }
          if (inside) {
            gCtx.fillStyle =
              (gx + gy) % 28 === 0 ? 'rgba(255, 255, 255, 0.85)' : 'rgba(52, 211, 153, 0.65)';
            gCtx.beginPath();
            gCtx.arc(gx, gy, (gx + gy) % 28 === 0 ? 2.4 : 1.5, 0, Math.PI * 2);
            gCtx.fill();
          }
        }
      }

      // Latitude / Longitude Holographic Graticule Grid
      gCtx.strokeStyle = 'rgba(52, 211, 153, 0.28)';
      gCtx.lineWidth = 1.5;
      for (let x = 0; x <= 1024; x += 64) {
        gCtx.beginPath();
        gCtx.moveTo(x, 0);
        gCtx.lineTo(x, 512);
        gCtx.stroke();
      }
      for (let y = 0; y <= 512; y += 64) {
        gCtx.beginPath();
        gCtx.moveTo(0, y);
        gCtx.lineTo(1024, y);
        gCtx.stroke();
      }

      // Glowing Submarine Fiber-Optic Telemetry Arcs to AP-SOUTH-1 Hub (710, 235)
      const hubs: [number, number][] = [
        [210, 165],
        [515, 145],
        [535, 285],
        [835, 355],
        [295, 335],
      ];
      hubs.forEach(([hx, hy]) => {
        gCtx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
        gCtx.lineWidth = 2.2;
        gCtx.beginPath();
        gCtx.moveTo(710, 235);
        gCtx.quadraticCurveTo((710 + hx) / 2, Math.min(235, hy) - 65, hx, hy);
        gCtx.stroke();
      });

      // Bright AP-SOUTH-1 (Bengaluru) Primary Cluster Beacon on Globe
      gCtx.beginPath();
      gCtx.arc(710, 235, 16, 0, Math.PI * 2);
      gCtx.strokeStyle = '#ffffff';
      gCtx.lineWidth = 3;
      gCtx.stroke();
      gCtx.beginPath();
      gCtx.arc(710, 235, 7, 0, Math.PI * 2);
      gCtx.fillStyle = '#ffffff';
      gCtx.fill();
    }

    // --------------------------------------------------------------------------
    // 4. Initialize WebGLRenderer (or High-Precision 2D 3D-Projection Fallback)
    // --------------------------------------------------------------------------
    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.25;
      container.innerHTML = '';
      container.appendChild(renderer.domElement);
    } catch {
      renderer = null;
    }

    // High-Precision 2D Canvas 3D-Scene Fallback if WebGL context is restricted
    if (!renderer) {
      const fallbackCanvas = document.createElement('canvas');
      fallbackCanvas.width = width * 2;
      fallbackCanvas.height = height * 2;
      fallbackCanvas.style.width = '100%';
      fallbackCanvas.style.height = '100%';
      container.innerHTML = '';
      container.appendChild(fallbackCanvas);
      const ctx2d = fallbackCanvas.getContext('2d');
      let anim2d = 0;
      let t2d = 0;

      const loop2d = () => {
        anim2d = requestAnimationFrame(loop2d);
        if (!ctx2d || !isInViewRef.current) return;
        const speed = (isPausedRef.current ? 0 : 0.022) + pulseBoostRef.current * 0.035;
        t2d += speed;
        if (pulseBoostRef.current > 0) {
          pulseBoostRef.current = Math.max(0, pulseBoostRef.current - 0.03);
        }

        ctx2d.save();
        ctx2d.scale(2, 2);
        ctx2d.clearRect(0, 0, width, height);

        const cx = width * 0.58;
        const cy = height * 0.48;
        const r = Math.min(width, height) * 0.25;

        // Atmospheric outer glow
        const halo = ctx2d.createRadialGradient(cx, cy, r * 0.2, cx, cy, r * 1.55);
        halo.addColorStop(0, 'rgba(52, 211, 153, 0.75)');
        halo.addColorStop(0.55, 'rgba(16, 185, 129, 0.32)');
        halo.addColorStop(0.85, 'rgba(6, 182, 212, 0.12)');
        halo.addColorStop(1, 'rgba(2, 6, 23, 0)');
        ctx2d.fillStyle = halo;
        ctx2d.beginPath();
        ctx2d.arc(cx, cy, r * 1.55, 0, Math.PI * 2);
        ctx2d.fill();

        // Globe sphere
        const sphereGrad = ctx2d.createRadialGradient(
          cx - r * 0.28,
          cy - r * 0.28,
          r * 0.08,
          cx,
          cy,
          r
        );
        sphereGrad.addColorStop(0, '#6ee7b7');
        sphereGrad.addColorStop(0.45, '#10b981');
        sphereGrad.addColorStop(0.85, '#064e3b');
        sphereGrad.addColorStop(1, '#022c22');
        ctx2d.fillStyle = sphereGrad;
        ctx2d.beginPath();
        ctx2d.arc(cx, cy, r, 0, Math.PI * 2);
        ctx2d.fill();

        // 3 Gyroscopic Rings + Traveling Packets
        const ringColors = ['#34d399', '#38bdf8', '#c084fc'];
        [1.42, 1.64, 1.84].forEach((mult, idx) => {
          ctx2d.save();
          ctx2d.translate(cx, cy);
          const tilt = (idx - 1) * 0.52 + Math.sin(t2d * 0.3 + idx) * 0.12;
          ctx2d.rotate(tilt);
          ctx2d.strokeStyle = ringColors[idx];
          ctx2d.lineWidth = 2;
          ctx2d.beginPath();
          ctx2d.ellipse(0, 0, r * mult, r * mult * 0.36, 0, 0, Math.PI * 2);
          ctx2d.stroke();

          // Traveling packet on ellipse
          const pAng = t2d * (idx % 2 === 0 ? 1.8 : -1.5) + idx * 2;
          const px = Math.cos(pAng) * r * mult;
          const py = Math.sin(pAng) * r * mult * 0.36;
          ctx2d.fillStyle = '#ffffff';
          ctx2d.beginPath();
          ctx2d.arc(px, py, 4.5, 0, Math.PI * 2);
          ctx2d.fill();
          ctx2d.restore();
        });

        // Laptop on left foreground
        const node = STACK_NODES.find((n) => n.id === activeNodeRef.current) || STACK_NODES[0];
        drawLaptopScreen(t2d, node);
        const lx = width * 0.08;
        const ly = height * 0.34;
        const lw = width * 0.42;
        const lh = height * 0.42;
        ctx2d.drawImage(screenCanvas, lx, ly, lw, lh);
        ctx2d.restore();
      };
      anim2d = requestAnimationFrame(loop2d);
      return () => cancelAnimationFrame(anim2d);
    }

    // --------------------------------------------------------------------------
    // 5. Build Three.js Scene Hierarchy
    // --------------------------------------------------------------------------
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.22, 6.75);

    // Multi-point studio lighting rig
    scene.add(new THREE.AmbientLight(0xffffff, 1.55));

    const keyLight = new THREE.PointLight(0x34d399, 5.5, 28);
    keyLight.position.set(4.5, 5.5, 6.5);
    scene.add(keyLight);

    const cyanLight = new THREE.PointLight(0x38bdf8, 4.5, 25);
    cyanLight.position.set(-5.5, -2.5, 5.5);
    scene.add(cyanLight);

    const violetLight = new THREE.PointLight(0xc084fc, 3.8, 22);
    violetLight.position.set(2.5, -4.5, -3.5);
    scene.add(violetLight);

    // Master Orbital Core Group (Right-Center)
    const masterGroup = new THREE.Group();
    masterGroup.position.set(0.32, 0.06, 0);
    scene.add(masterGroup);

    // A. Cyber Globe + Atmospheric Fresnel Shell + Dual Geodesic Wireframes
    const globeTex = new THREE.CanvasTexture(globeCanvas);
    globeTex.anisotropy = 4;

    const globeGeo = new THREE.SphereGeometry(1.18, 64, 64);
    const globeMat = new THREE.MeshStandardMaterial({
      map: globeTex,
      emissive: 0x10b981,
      emissiveMap: globeTex,
      emissiveIntensity: 0.72,
      roughness: 0.22,
      metalness: 0.55,
    });
    const globeMesh = new THREE.Mesh(globeGeo, globeMat);
    masterGroup.add(globeMesh);

    // Volumetric outer atmosphere rim glow sphere
    const atmoGeo = new THREE.SphereGeometry(1.26, 48, 48);
    const atmoMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.14,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
    const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
    masterGroup.add(atmoMesh);

    // Primary Geodesic Wireframe Icosahedron Shell
    const wireGeo = new THREE.IcosahedronGeometry(1.35, 2);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      wireframe: true,
      transparent: true,
      opacity: 0.34,
      blending: THREE.AdditiveBlending,
    });
    const wireShell = new THREE.Mesh(wireGeo, wireMat);
    masterGroup.add(wireShell);

    // Secondary Counter-Rotating Cyan Geodesic Lattice
    const outerWireGeo = new THREE.IcosahedronGeometry(1.44, 1);
    const outerWireMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending,
    });
    const outerWireShell = new THREE.Mesh(outerWireGeo, outerWireMat);
    masterGroup.add(outerWireShell);

    // Interactive Shockwave Ring (expands on Pulse or Node click)
    const shockGeo = new THREE.RingGeometry(1.2, 1.32, 64);
    const shockMat = new THREE.MeshBasicMaterial({
      color: 0x6ee7b7,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    const shockwaveMesh = new THREE.Mesh(shockGeo, shockMat);
    masterGroup.add(shockwaveMesh);

    // B. Three Gyroscopic Orbital Rings + Multi-Packet Comet Streams
    const ringConfigs = [
      { radius: 1.84, color: 0x34d399, rx: 1.12, ry: 0.28, speed: 0.88 },
      { radius: 2.1, color: 0x38bdf8, rx: -0.92, ry: 0.52, speed: -0.72 },
      { radius: 2.34, color: 0xc084fc, rx: 0.68, ry: -0.82, speed: 0.58 },
    ];

    const orbitalRings: {
      group: THREE.Group;
      packets: THREE.Mesh[];
      radius: number;
      speed: number;
    }[] = [];

    ringConfigs.forEach((rc) => {
      const rg = new THREE.Group();
      rg.rotation.set(rc.rx, rc.ry, 0);

      // Main glowing orbital track
      const tGeo = new THREE.TorusGeometry(rc.radius, 0.018, 20, 160);
      const tMat = new THREE.MeshBasicMaterial({
        color: rc.color,
        transparent: true,
        opacity: 0.82,
      });
      rg.add(new THREE.Mesh(tGeo, tMat));

      // Soft outer bloom tube on the orbital track
      const glowGeo = new THREE.TorusGeometry(rc.radius, 0.042, 12, 120);
      const glowMat = new THREE.MeshBasicMaterial({
        color: rc.color,
        transparent: true,
        opacity: 0.18,
        blending: THREE.AdditiveBlending,
      });
      rg.add(new THREE.Mesh(glowGeo, glowMat));

      // Primary data packet + 3 comet trail spheres
      const packets: THREE.Mesh[] = [];
      [0.072, 0.048, 0.034, 0.022].forEach((sz, pIdx) => {
        const pGeo = new THREE.SphereGeometry(sz, 16, 16);
        const pMat = new THREE.MeshBasicMaterial({
          color: pIdx === 0 ? 0xffffff : rc.color,
          transparent: true,
          opacity: 1 - pIdx * 0.22,
        });
        const pkt = new THREE.Mesh(pGeo, pMat);
        rg.add(pkt);
        packets.push(pkt);
      });

      masterGroup.add(rg);
      orbitalRings.push({ group: rg, packets, radius: rc.radius, speed: rc.speed });
    });

    // C. Six Orbiting Crystal Satellites with Equatorial Rings, Cages & Laser Beams
    const satellites: {
      id: string;
      group: THREE.Group;
      crystal: THREE.Mesh;
      cage: THREE.Mesh;
      beam: THREE.Line;
      radius: number;
      speed: number;
      inclination: number;
      phase: number;
    }[] = [];

    const clickableMeshes: THREE.Object3D[] = [];

    STACK_NODES.forEach((node, idx) => {
      const sg = new THREE.Group();

      // Core Octahedron Crystal
      const cGeo = new THREE.OctahedronGeometry(0.175, 0);
      const cMat = new THREE.MeshStandardMaterial({
        color: node.hex,
        emissive: node.hex,
        emissiveIntensity: 0.95,
        roughness: 0.15,
        metalness: 0.85,
      });
      const crystal = new THREE.Mesh(cGeo, cMat);
      crystal.userData = { nodeId: node.id };
      sg.add(crystal);
      clickableMeshes.push(crystal);

      // Counter-rotating Wireframe Cage
      const cageGeo = new THREE.OctahedronGeometry(0.23, 0);
      const cageMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0.35,
      });
      const cage = new THREE.Mesh(cageGeo, cageMat);
      sg.add(cage);

      // Equatorial Saturn Halo Ring
      const hGeo = new THREE.RingGeometry(0.24, 0.295, 32);
      const hMat = new THREE.MeshBasicMaterial({
        color: node.hex,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending,
      });
      const halo = new THREE.Mesh(hGeo, hMat);
      halo.rotation.x = Math.PI / 2;
      sg.add(halo);

      masterGroup.add(sg);

      // Laser Telemetry Beam to Globe Core
      const bGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(1, 1, 1),
      ]);
      const bMat = new THREE.LineBasicMaterial({
        color: node.hex,
        transparent: true,
        opacity: 0.42,
      });
      const beam = new THREE.Line(bGeo, bMat);
      masterGroup.add(beam);

      satellites.push({
        id: node.id,
        group: sg,
        crystal,
        cage,
        beam,
        radius: 2.18 + (idx % 3) * 0.28,
        speed: (idx % 2 === 0 ? 1 : -1) * (0.44 + idx * 0.055),
        inclination: (idx - 2.5) * 0.26,
        phase: (idx * Math.PI) / 3,
      });
    });

    // D. High-Craft 3D Holographic Code Terminal Workstation Laptop (Left Foreground)
    const laptopGroup = new THREE.Group();
    let laptopBaseY = -0.54;
    laptopGroup.position.set(-1.36, laptopBaseY, 1.18);
    laptopGroup.rotation.set(0.07, 0.43, -0.025);
    scene.add(laptopGroup);

    const applyResponsive3DLayout = (w: number, h: number) => {
      const aspect = w / Math.max(h, 1);
      if (w < 540 || aspect < 1.05) {
        camera.position.set(0, 0.14, Math.max(8.15, 7.05 / Math.max(aspect, 0.72)));
        masterGroup.position.set(0.14, 0.34, 0);
        masterGroup.scale.setScalar(0.76);
        laptopBaseY = -0.68;
        laptopGroup.position.set(-0.56, laptopBaseY, 1.08);
        laptopGroup.scale.setScalar(0.64);
      } else {
        camera.position.set(0, 0.22, 6.75);
        masterGroup.position.set(0.32, 0.06, 0);
        masterGroup.scale.setScalar(1.0);
        laptopBaseY = -0.54;
        laptopGroup.position.set(-1.36, laptopBaseY, 1.18);
        laptopGroup.scale.setScalar(1.0);
      }
    };
    applyResponsive3DLayout(width, height);

    const screenTex = new THREE.CanvasTexture(screenCanvas);
    screenTex.minFilter = THREE.LinearFilter;
    screenTex.magFilter = THREE.LinearFilter;
    screenTex.anisotropy = 4;

    // Sleek CNC Aluminum Lid
    const lidGeo = new THREE.BoxGeometry(2.22, 1.4, 0.048);
    const lidMat = new THREE.MeshStandardMaterial({
      color: 0x091426,
      emissive: 0x064e3b,
      emissiveIntensity: 0.22,
      roughness: 0.25,
      metalness: 0.85,
    });
    const lidMesh = new THREE.Mesh(lidGeo, lidMat);
    laptopGroup.add(lidMesh);

    // Neon Emerald Edge Highlight on Display Lid
    const lidEdges = new THREE.EdgesGeometry(lidGeo);
    const lidEdgeLine = new THREE.LineSegments(
      lidEdges,
      new THREE.LineBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.75 })
    );
    laptopGroup.add(lidEdgeLine);

    // High-DPI Code Display Surface
    const displayGeo = new THREE.PlaneGeometry(2.12, 1.31);
    const displayMat = new THREE.MeshBasicMaterial({ map: screenTex });
    const displayMesh = new THREE.Mesh(displayGeo, displayMat);
    displayMesh.position.z = 0.026;
    laptopGroup.add(displayMesh);

    // Backlit Mechanical Keyboard & Trackpad Base Deck
    const kbTex = new THREE.CanvasTexture(keyboardCanvas);
    kbTex.anisotropy = 4;

    const baseGeo = new THREE.BoxGeometry(2.24, 0.055, 1.38);
    const baseMaterials = [
      new THREE.MeshStandardMaterial({ color: 0x0f293a, metalness: 0.8, roughness: 0.3 }), // right
      new THREE.MeshStandardMaterial({ color: 0x0f293a, metalness: 0.8, roughness: 0.3 }), // left
      new THREE.MeshBasicMaterial({ map: kbTex }), // top (backlit keyboard & trackpad)
      new THREE.MeshStandardMaterial({ color: 0x040b14, metalness: 0.8, roughness: 0.4 }), // bottom
      new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 0.45 }), // front lip
      new THREE.MeshStandardMaterial({ color: 0x0f293a, metalness: 0.8, roughness: 0.3 }), // back
    ];
    const baseMesh = new THREE.Mesh(baseGeo, baseMaterials);
    baseMesh.position.set(0, -0.71, 0.65);
    baseMesh.rotation.x = 0.16;
    laptopGroup.add(baseMesh);

    // Neon Edge Highlight on Keyboard Base
    const baseEdges = new THREE.EdgesGeometry(baseGeo);
    const baseEdgeLine = new THREE.LineSegments(
      baseEdges,
      new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.55 })
    );
    baseEdgeLine.position.copy(baseMesh.position);
    baseEdgeLine.rotation.copy(baseMesh.rotation);
    laptopGroup.add(baseEdgeLine);

    // E. Dual-Layer Deep-Space Starfield & Cyber Matrix Particles
    const starCount = 380;
    const starPos = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const cEmerald = new THREE.Color(0x34d399);
    const cCyan = new THREE.Color(0x38bdf8);

    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() - 0.45) * 11.5;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 7.5;
      starPos[i * 3 + 2] = (Math.random() - 0.5) * 6.5 - 1;

      const col = i % 3 === 0 ? cCyan : cEmerald;
      starColors[i * 3] = col.r;
      starColors[i * 3 + 1] = col.g;
      starColors[i * 3 + 2] = col.b;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starMat = new THREE.PointsMaterial({
      size: 0.052,
      vertexColors: true,
      transparent: true,
      opacity: 0.82,
      blending: THREE.AdditiveBlending,
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // --------------------------------------------------------------------------
    // 6. Interactive Pointer Orbit, Parallax & Satellite Click Raycasting
    // --------------------------------------------------------------------------
    let isDragging = false;
    let pointerDownX = 0;
    let pointerDownY = 0;
    let prevX = 0;
    let prevY = 0;
    let dragRotX = 0;
    let dragRotY = 0;
    let hoverX = 0;
    let hoverY = 0;

    const raycaster = new THREE.Raycaster();
    const pointerNDC = new THREE.Vector2();

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      pointerDownX = e.clientX;
      pointerDownY = e.clientY;
      prevX = e.clientX;
      prevY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      hoverX = ((e.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
      hoverY = -(((e.clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1);

      if (isDragging) {
        dragRotY += (e.clientX - prevX) * 0.008;
        dragRotX = Math.max(-0.5, Math.min(0.5, dragRotX + (e.clientY - prevY) * 0.008));
        prevX = e.clientX;
        prevY = e.clientY;
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (isDragging) {
        const movedDist = Math.hypot(e.clientX - pointerDownX, e.clientY - pointerDownY);
        if (movedDist < 6) {
          const rect = container.getBoundingClientRect();
          pointerNDC.x = ((e.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
          pointerNDC.y = -(((e.clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1);
          raycaster.setFromCamera(pointerNDC, camera);
          const hits = raycaster.intersectObjects(clickableMeshes, false);
          if (hits.length > 0 && hits[0].object.userData?.nodeId) {
            handleSelectStackNode(hits[0].object.userData.nodeId);
          }
        }
      }
      isDragging = false;
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cr = entry.contentRect;
        if (cr.width > 0 && cr.height > 0 && renderer) {
          width = cr.width;
          height = cr.height;
          applyResponsive3DLayout(width, height);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
        }
      }
    });
    resizeObserver.observe(container);

    // --------------------------------------------------------------------------
    // 7. 60FPS Render Loop
    // --------------------------------------------------------------------------
    let animId = 0;
    let clockTime = 0;
    let lastFrameTime = performance.now();
    let texFrameCounter = 0;

    const animate = (now: number) => {
      animId = requestAnimationFrame(animate);
      if (!isInViewRef.current) {
        lastFrameTime = now;
        return;
      }
      const dt = Math.min((now - lastFrameTime) / 1000, 0.1);
      lastFrameTime = now;

      if (pulseBoostRef.current > 0) {
        pulseBoostRef.current = Math.max(0, pulseBoostRef.current - dt * 1.8);
      }

      const speedMult = (isPausedRef.current ? 0 : 1) + pulseBoostRef.current * 2.2;
      clockTime += dt * speedMult;

      // Rotate Cyber Globe & Dual Geodesic Wireframe Shells
      globeMesh.rotation.y = clockTime * 0.52;
      wireShell.rotation.y = -clockTime * 0.36;
      wireShell.rotation.x = clockTime * 0.2;
      outerWireShell.rotation.y = clockTime * 0.24;
      outerWireShell.rotation.z = -clockTime * 0.18;

      const scalePulse = 1 + Math.sin(clockTime * 3.0) * 0.025 + pulseBoostRef.current * 0.045;
      globeMesh.scale.setScalar(scalePulse);
      wireShell.scale.setScalar(scalePulse * 1.015);

      // Update Shockwave Ring Expansion
      if (shockwaveRef.current > 0) {
        shockwaveRef.current += dt * 2.4;
        const sProg = shockwaveRef.current;
        if (sProg >= 1) {
          shockwaveRef.current = 0;
          shockMat.opacity = 0;
        } else {
          shockwaveMesh.scale.setScalar(1 + sProg * 1.35);
          shockMat.opacity = (1 - sProg) * 0.75;
          shockwaveMesh.lookAt(camera.position);
        }
      }

      // Update Gyroscopic Orbital Rings & Multi-Packet Comet Streams
      orbitalRings.forEach((ring, i) => {
        ring.group.rotation.z += dt * ring.speed * speedMult * 0.38;
        const baseAngle = clockTime * ring.speed * 1.65 + i * 2.1;
        ring.packets.forEach((pkt, pIdx) => {
          const pAngle = baseAngle - pIdx * 0.11 * Math.sign(ring.speed);
          pkt.position.set(
            Math.cos(pAngle) * ring.radius,
            Math.sin(pAngle) * ring.radius,
            0
          );
        });
      });

      // Update Orbiting Crystal Satellites & Laser Beams
      satellites.forEach((sat) => {
        const angle = clockTime * sat.speed + sat.phase;
        const x = Math.cos(angle) * sat.radius;
        const z = Math.sin(angle) * sat.radius;
        const y = Math.sin(angle * 1.3) * sat.inclination;

        sat.group.position.set(x, y, z);
        sat.crystal.rotation.y += dt * 2.4;
        sat.crystal.rotation.x += dt * 1.6;
        sat.cage.rotation.y -= dt * 1.8;

        const isSelected = sat.id === activeNodeRef.current;
        sat.group.scale.setScalar(isSelected ? 1.35 : 1.0);

        const positions = sat.beam.geometry.attributes.position.array as Float32Array;
        positions[3] = x;
        positions[4] = y;
        positions[5] = z;
        sat.beam.geometry.attributes.position.needsUpdate = true;
      });

      // Smooth Floating Levitation & Parallax for Holographic Code Laptop
      laptopGroup.position.y = laptopBaseY + Math.sin(clockTime * 2.2) * 0.055;
      laptopGroup.rotation.y = 0.43 + hoverX * 0.11;
      laptopGroup.rotation.x = 0.07 - hoverY * 0.07;

      // Update Scrolling Code & Oscilloscope on Laptop Screen Texture (throttled for 60fps scroll performance)
      texFrameCounter++;
      if (texFrameCounter % 5 === 0) {
        const currentNode =
          STACK_NODES.find((n) => n.id === activeNodeRef.current) || STACK_NODES[0];
        drawLaptopScreen(clockTime, currentNode);
        screenTex.needsUpdate = true;
      }

      // Starfield drift + smooth damping for interactive globe tilt
      starField.rotation.y = clockTime * 0.07;
      masterGroup.rotation.y += (dragRotY + hoverX * 0.24 - masterGroup.rotation.y) * 0.08;
      masterGroup.rotation.x += (dragRotX - hoverY * 0.16 - masterGroup.rotation.x) * 0.08;

      renderer?.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      domEl.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      if (renderer) {
        renderer.dispose();
      }
    };
  }, [activeTab, handleSelectStackNode]);

  return (
    <div className="relative w-full h-full select-none overflow-hidden rounded-3xl bg-[#020713] flex flex-col justify-between">
      {/* Multi-Layer Volumetric Cyber Glow Backdrop */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 60% 46%, rgba(16, 185, 129, 0.22) 0%, rgba(6, 182, 212, 0.10) 42%, rgba(168, 85, 247, 0.05) 68%, transparent 85%)',
        }}
      />

      {/* Subtle Architectural HUD Corner Reticles */}
      <div className="pointer-events-none absolute inset-2.5 z-20 rounded-2xl border border-emerald-500/[0.08]">
        <span className="absolute -top-px -left-px w-3.5 h-3.5 border-t-2 border-l-2 border-emerald-400/60 rounded-tl-md" />
        <span className="absolute -top-px -right-px w-3.5 h-3.5 border-t-2 border-r-2 border-emerald-400/60 rounded-tr-md" />
        <span className="absolute -bottom-px -left-px w-3.5 h-3.5 border-b-2 border-l-2 border-emerald-400/60 rounded-bl-md" />
        <span className="absolute -bottom-px -right-px w-3.5 h-3.5 border-b-2 border-r-2 border-emerald-400/60 rounded-br-md" />
      </div>

      {/* TOP BAR: AP-SOUTH-1 Live RPS Pill + 3D Core / Pipeline / Topology Switcher */}
      <div className="relative z-30 flex flex-wrap sm:flex-nowrap items-center justify-between gap-1.5 sm:gap-2 px-2.5 sm:px-4 pt-2.5 sm:pt-3.5 pb-1 sm:pb-1.5">
        {/* Left Region + Live RPS Pill */}
        <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-[#040d1d]/90 border border-emerald-500/35 shadow-[0_0_20px_rgba(16,185,129,0.16)] backdrop-blur-xl whitespace-nowrap shrink-0">
          <Globe
            className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400 animate-spin shrink-0"
            style={{ animationDuration: '10s' }}
          />
          <span className="text-[9px] sm:text-[11px] font-mono font-extrabold tracking-wider text-white uppercase whitespace-nowrap">
            AP-SOUTH-1
          </span>
          <span className="text-emerald-500/60">•</span>
          <span className="text-[9px] sm:text-[11px] font-mono font-extrabold text-emerald-400 whitespace-nowrap tabular-nums">
            {liveRps.toLocaleString()} RPS
          </span>
        </div>

        {/* Right 3-Tab Switcher: 3D Core | Pipeline | Topology */}
        <div className="flex items-center gap-0.5 sm:gap-1 p-0.5 sm:p-1 rounded-full bg-[#040d1d]/90 border border-slate-800/90 backdrop-blur-xl shadow-lg shrink-0">
          {(
            [
              { id: 'core', label: '3D Core' },
              { id: 'pipeline', label: 'Pipeline' },
              { id: 'topology', label: 'Topology' },
            ] as { id: ShowcaseTab; label: string }[]
          ).map((tab) => {
            const isAct = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  soundFx.playTab(880);
                  setActiveTab(tab.id);
                }}
                className={`relative px-2.5 sm:px-3.5 py-1 rounded-full text-[9px] sm:text-[11px] font-mono font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  isAct ? 'text-slate-950 font-extrabold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isAct && (
                  <motion.span
                    layoutId="three-d-hero-tab-pill"
                    transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 shadow-[0_0_16px_rgba(16,185,129,0.65)]"
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CENTER STAGE (Explicit absolute child positioning prevents flex height collapse) */}
      <div className="relative flex-1 w-full min-h-[300px] overflow-hidden">
        <AnimatePresence mode="wait">
          {/* ===============================================================
              TAB 1: 3D CORE (Cyber Globe + Holographic Laptop + Interactive HUD)
          =============================================================== */}
          {activeTab === 'core' && (
            <motion.div
              key="core"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 w-full h-full"
            >
              {/* Subtle Top-Left Active Node Telemetry Micro-HUD */}
              <motion.div
                key={activeNode.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.22 }}
                className="pointer-events-none absolute top-1.5 left-4 z-20 hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#040d1d]/75 border border-emerald-500/25 backdrop-blur-md text-[10px] font-mono"
              >
                <span
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: activeNode.color }}
                />
                <span className="text-slate-200 font-bold">{activeNode.role}</span>
                <span className="text-slate-600">•</span>
                <span className="text-emerald-400 font-bold">P99 {activeNode.latency}</span>
                <span className="text-slate-600">•</span>
                <span className="text-cyan-300 font-semibold">{activeNode.throughput}</span>
              </motion.div>

              {/* WebGL 3D Scene Mount */}
              <div
                ref={mountRef}
                className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing z-10"
                title="Drag to rotate 3D Cyber Core • Click any satellite or bottom tech node to inspect"
              />
            </motion.div>
          )}

          {/* ===============================================================
              TAB 2: PIPELINE (Interactive Request Execution Stream)
          =============================================================== */}
          {activeTab === 'pipeline' && (
            <motion.div
              key="pipeline"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22 }}
              className="absolute inset-0 w-full h-full px-4 py-3 flex flex-col justify-between overflow-y-auto z-20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold block">
                    Live Execution Pipeline
                  </span>
                  <h4 className="text-sm font-extrabold text-white">
                    Distributed Request Choreography (Click Any Stage)
                  </h4>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-[10px] font-bold">
                  Roundtrip: 4.4ms
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 my-2">
                {[
                  {
                    idx: 0,
                    name: 'Client Edge',
                    sub: 'React 19 + TLS 1.3',
                    ms: '0.6ms',
                    icon: <Layers className="w-4 h-4 text-cyan-400" />,
                  },
                  {
                    idx: 1,
                    name: 'Auth Filter',
                    sub: 'RS512 JWT Guard',
                    ms: '0.5ms',
                    icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
                  },
                  {
                    idx: 2,
                    name: 'Spring Boot',
                    sub: 'Java 21 Virtual VM',
                    ms: '1.3ms',
                    icon: <Server className="w-4 h-4 text-emerald-400" />,
                  },
                  {
                    idx: 3,
                    name: 'Kafka Mesh',
                    sub: 'Async Event Bus',
                    ms: '1.1ms',
                    icon: <Activity className="w-4 h-4 text-purple-400" />,
                  },
                  {
                    idx: 4,
                    name: 'MySQL + Redis',
                    sub: '3NF + L2 Cache',
                    ms: '0.9ms',
                    icon: <Database className="w-4 h-4 text-amber-400" />,
                  },
                ].map((stage) => {
                  const isCurrent = activePipelineStep === stage.idx;
                  return (
                    <button
                      key={stage.idx}
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        setActivePipelineStep(stage.idx);
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-emerald-500/15 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.25)] scale-[1.02]'
                          : 'bg-slate-900/80 border-slate-800/90 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        {stage.icon}
                        <span className="text-[10px] font-mono font-bold text-emerald-400">
                          {stage.ms}
                        </span>
                      </div>
                      <p className="text-xs font-extrabold text-white truncate">{stage.name}</p>
                      <p className="text-[10px] font-mono text-slate-400 truncate mt-0.5">
                        {stage.sub}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/90 border border-emerald-500/25 font-mono text-[11px] text-slate-200">
                <div className="flex items-center justify-between text-[10px] text-emerald-400 font-bold mb-1">
                  <span>STAGE #{activePipelineStep + 1} TELEMETRY STREAM</span>
                  <span>HTTP/2 200 OK</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {
                    [
                      '>>> [EDGE_ROUTER] TLS 1.3 handshake complete; routing request to ap-south-1 ingress.',
                      '>>> [JWT_SECURITY] Verified RS512 token signature & RBAC claims in 0.5ms (stateless).',
                      '>>> [SPRING_BOOT_3.4] Dispatched controller action on Java 21 VirtualThread[#64].',
                      '>>> [KAFKA_STREAM] Published audit & analytics event to topic portfolio.telemetry.v2.',
                      '>>> [MYSQL_3NF_POOL] HikariCP connection returned indexed entity projection with Redis L2 hit.',
                    ][activePipelineStep]
                  }
                </p>
              </div>
            </motion.div>
          )}

          {/* ===============================================================
              TAB 3: TOPOLOGY (Interactive Multi-AZ Cloud Architecture Map)
          =============================================================== */}
          {activeTab === 'topology' && (
            <motion.div
              key="topology"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22 }}
              className="absolute inset-0 w-full h-full px-4 py-3 flex flex-col justify-between overflow-y-auto z-20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold block">
                    Cloud Cluster Topology
                  </span>
                  <h4 className="text-sm font-extrabold text-white">
                    Interactive Microservice Node Matrix
                  </h4>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono text-[10px] font-bold">
                  6 Active Nodes • 99.99% SLA
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-2">
                {STACK_NODES.map((node) => {
                  const isSel = node.id === activeNodeId;
                  return (
                    <button
                      key={node.id}
                      type="button"
                      onClick={() => handleSelectStackNode(node.id)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSel
                          ? 'bg-emerald-500/15 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                          : 'bg-slate-900/80 border-slate-800/90 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-extrabold text-white">{node.name}</span>
                        <span className="text-[10px] font-mono font-bold text-emerald-400">
                          {node.latency}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-300 truncate">{node.role}</p>
                      <p className="text-[9px] font-mono text-cyan-400 mt-1">{node.throughput}</p>
                    </button>
                  );
                })}
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-300">
                <span>
                  Selected Node: <strong className="text-emerald-400">{activeNode.role}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('core')}
                  className="text-emerald-400 hover:underline font-bold cursor-pointer"
                >
                  View in 3D Core →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* BOTTOM DOCK BAR: Interactive Stack Links + Pulse (24) + Pause Button */}
      <div className="relative z-30 mx-2.5 sm:mx-3.5 mb-2.5 sm:mb-3 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-2xl bg-[#040d1d]/90 border border-emerald-500/25 shadow-[0_4px_24px_rgba(0,0,0,0.45)] backdrop-blur-xl flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar text-[9px] sm:text-[11px] font-mono font-bold">
          {STACK_NODES.map((node, idx) => {
            const isSel = activeNodeId === node.id;
            return (
              <React.Fragment key={node.id}>
                <button
                  type="button"
                  onClick={() => handleSelectStackNode(node.id)}
                  className={`transition-all cursor-pointer whitespace-nowrap px-1.5 py-0.5 rounded-md ${
                    isSel
                      ? 'text-white bg-emerald-500/20 border border-emerald-400/50 shadow-[0_0_12px_rgba(16,185,129,0.35)]'
                      : 'text-emerald-400 hover:text-emerald-300'
                  }`}
                >
                  {node.name}
                </button>
                {idx < STACK_NODES.length - 1 && (
                  <span className="text-slate-600 select-none">·</span>
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={handleTriggerPulse}
            className="px-2.5 sm:px-3.5 py-1 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/45 text-emerald-300 font-mono text-[9px] sm:text-[11px] font-extrabold flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer shadow-[0_0_16px_rgba(16,185,129,0.25)] active:scale-95 whitespace-nowrap"
          >
            <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-400 shrink-0" />
            <span>Pulse ({pulseCount})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setIsPaused((p) => !p);
            }}
            className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-emerald-400 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title={isPaused ? 'Resume 3D Animation' : 'Pause 3D Animation'}
          >
            {isPaused ? <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : <Pause className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
          </button>
        </div>
      </div>
    </div>
  );
}
