#!/usr/bin/env node
// Audit de parité visuelle Phase 0 — surface publique.
//
// Capture des PNG en parallèle :
//   - le WIREFRAME d'origine (_wireframe/index.html via http-server :8080)
//     → docs/wireframe/screenshots-public/<slug>-<viewport>.png
//   - le BUILD de référence (apps/web dev :5173)
//     → scripts/parite/build-captures/<slug>-<viewport>.png
//
// Servira ensuite aux étapes 9-12 (les wireframes ont déjà des screenshots
// committées dans _wireframe/screenshots/, mais ce script complète et
// normalise par viewport).

import { spawn } from 'node:child_process';
import { mkdirSync, existsSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as sleep } from 'node:timers/promises';

import { chromium } from 'playwright';

import { ROUTES, VIEWPORTS } from './routes.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const racine = resolve(__dirname, '../..');

const PORT_WIREFRAME = 8080;
const PORT_BUILD = 5173;
const ATTENTE_RESEAU = 1500; // ms après load, le temps que les animations se calment

const OUT_WIREFRAME = resolve(racine, 'docs/wireframe/screenshots-public');
const OUT_BUILD = resolve(__dirname, 'build-captures');

mkdirSync(OUT_WIREFRAME, { recursive: true });
if (existsSync(OUT_BUILD)) rmSync(OUT_BUILD, { recursive: true });
mkdirSync(OUT_BUILD, { recursive: true });

// ─── Démarrage des serveurs ────────────────────────────────────────────────

function spawnServeur(commande, args, options = {}) {
  const child = spawn(commande, args, { stdio: 'pipe', ...options });
  child.stdout.on('data', () => {});
  child.stderr.on('data', () => {});
  return child;
}

async function attendrePort(port, timeoutMs = 30_000) {
  const debut = Date.now();
  while (Date.now() - debut < timeoutMs) {
    try {
      const res = await fetch(`http://localhost:${port}/`);
      if (res.status > 0) return;
    } catch {
      /* pas encore prêt */
    }
    await sleep(300);
  }
  throw new Error(`Le serveur sur port ${port} n'a pas démarré en ${timeoutMs}ms`);
}

console.log('▸ Démarrage http-server pour _wireframe (port 8080)…');
const serveurWireframe = spawnServeur('npx', [
  'http-server',
  resolve(racine, '_wireframe'),
  '-p',
  String(PORT_WIREFRAME),
  '--silent',
  '--cors',
]);

console.log('▸ Démarrage vite dev pour apps/web (port 5173)…');
const serveurBuild = spawnServeur('npx', ['vite', 'dev', '--port', String(PORT_BUILD)], {
  cwd: resolve(racine, 'apps/web'),
});

try {
  await Promise.all([attendrePort(PORT_WIREFRAME), attendrePort(PORT_BUILD)]);
  console.log('✓ Serveurs prêts');

  const navigateur = await chromium.launch();
  console.log(`▸ Capture de ${ROUTES.length} routes × ${Object.keys(VIEWPORTS).length} viewports…\n`);

  for (const [nomViewport, viewport] of Object.entries(VIEWPORTS)) {
    const ctxWireframe = await navigateur.newContext({ viewport });
    const ctxBuild = await navigateur.newContext({ viewport });
    const pageWireframe = await ctxWireframe.newPage();
    const pageBuild = await ctxBuild.newPage();

    // Désactive les animations CSS pour réduire les écarts non significatifs
    await pageWireframe.addStyleTag({
      content: `*, *::before, *::after { animation-duration: 0s !important; transition-duration: 0s !important; }`,
    });
    await pageBuild.addStyleTag({
      content: `*, *::before, *::after { animation-duration: 0s !important; transition-duration: 0s !important; }`,
    });

    for (const { slug, wireframeHash, buildPath } of ROUTES) {
      // Wireframe
      const urlWireframe = `http://localhost:${PORT_WIREFRAME}/index.html${wireframeHash}`;
      try {
        await pageWireframe.goto(urlWireframe, { waitUntil: 'networkidle', timeout: 20_000 });
        await sleep(ATTENTE_RESEAU);
        const cible = resolve(OUT_WIREFRAME, `${slug}-${nomViewport}.png`);
        await pageWireframe.screenshot({ path: cible, fullPage: true });
        console.log(`  ✓ wireframe ${slug}-${nomViewport}`);
      } catch (e) {
        console.log(`  ✗ wireframe ${slug}-${nomViewport} : ${e.message}`);
      }

      // Build
      const urlBuild = `http://localhost:${PORT_BUILD}${buildPath}`;
      try {
        await pageBuild.goto(urlBuild, { waitUntil: 'networkidle', timeout: 20_000 });
        await sleep(ATTENTE_RESEAU);
        const cible = resolve(OUT_BUILD, `${slug}-${nomViewport}.png`);
        await pageBuild.screenshot({ path: cible, fullPage: true });
        console.log(`  ✓ build     ${slug}-${nomViewport}`);
      } catch (e) {
        console.log(`  ✗ build     ${slug}-${nomViewport} : ${e.message}`);
      }
    }

    await ctxWireframe.close();
    await ctxBuild.close();
  }

  await navigateur.close();
  console.log('\n✓ Captures terminées.');
  console.log(`  Références wireframe : ${OUT_WIREFRAME}`);
  console.log(`  Captures du build    : ${OUT_BUILD}`);
} finally {
  serveurWireframe.kill();
  serveurBuild.kill();
}
