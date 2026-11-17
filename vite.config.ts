import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      modulePreload: {
        polyfill: false,
        resolveDependencies(_filename, deps) {
          return deps.filter(
            (dep) =>
              !dep.includes('vendor-three') &&
              !dep.includes('vendor-d3') &&
              !dep.includes('vendor-charts') &&
              !dep.includes('vendor-lottie') &&
              !dep.includes('ThreeDHero') &&
              !dep.includes('ProjectPerformanceDashboard') &&
              !dep.includes('ProjectRechartsMetricsPanel') &&
              !dep.includes('AboutBiographyTimeline') &&
              !dep.includes('ArticleMonographCard') &&
              !dep.includes('CodingProfileSpotlightCard') &&
              !dep.includes('SkillsArchitectureShowcase') &&
              !dep.includes('TechProficiencyHeatmap') &&
              !dep.includes('ToolsEcosystemWorkbench') &&
              !dep.includes('ExperienceEducationShowcase') &&
              !dep.includes('CertificationsAchievementsShowcase') &&
              !dep.includes('AdminDashboard') &&
              !dep.includes('AdminLogin') &&
              !dep.includes('RecruiterDemoGate') &&
              !dep.includes('AIPortfolioChat') &&
              !dep.includes('DeveloperTerminalModal') &&
              !dep.includes('CodeExplorer') &&
              !dep.includes('DatabaseERD') &&
              !dep.includes('ArchitectureDiagram') &&
              !dep.includes('backendCode')
          );
        },
      },
      cssCodeSplit: true,
      minify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('three') || id.includes('@react-three')) {
                return 'vendor-three';
              }
              if (id.includes('d3-') || id.includes('/d3/')) {
                return 'vendor-d3';
              }
              if (id.includes('recharts') || id.includes('victory-vendor')) {
                return 'vendor-charts';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-lucide';
              }
              if (id.includes('framer-motion') || id.includes('motion')) {
                return 'vendor-motion';
              }
              if (id.includes('lottie-web')) {
                return 'vendor-lottie';
              }
              if (id.includes('react') || id.includes('react-dom')) {
                return 'vendor-react';
              }
            }
          },
        },
      },
      chunkSizeWarningLimit: 1200,
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: {
        ignored: [
          '**/src/data/db.json',
          '**/src/data/*.json',
          '**/db.json',
          '**/api/**',
          '**/dist/**',
          '**/logs/**'
        ],
      },
    },
  };
});
