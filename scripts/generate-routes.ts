import { Generator, configSchema } from '@tanstack/router-generator';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';

interface RouteTarget {
  name: string;
  routesDirectory: string;
  generatedRouteTree: string;
}

const targets: RouteTarget[] = [
  {
    name: 'Main App',
    routesDirectory: './app/routes',
    generatedRouteTree: './app/routeTree.gen.ts',
  },
  {
    name: 'Admin Layer',
    routesDirectory: './layers/admin/routes',
    generatedRouteTree: './layers/admin/routeTree.gen.ts',
  },
  {
    name: 'Auth Layer',
    routesDirectory: './layers/auth/routes',
    generatedRouteTree: './layers/auth/routeTree.gen.ts',
  },
];

console.log('🔄 Generating route trees for all layers...');

mkdirSync(path.resolve(process.cwd(), '.tmp'), { recursive: true });

for (const target of targets) {
  const routesDir = path.resolve(process.cwd(), target.routesDirectory);
  const genFile = path.resolve(process.cwd(), target.generatedRouteTree);

  if (!existsSync(routesDir)) {
    continue;
  }

  mkdirSync(path.dirname(genFile), { recursive: true });

  try {
    const config = configSchema.parse({
      routesDirectory: target.routesDirectory,
      generatedRouteTree: target.generatedRouteTree,
      tmpDir: '.tmp',
      disableLogging: true,
    });

    const generator = new Generator({
      root: process.cwd(),
      config,
    });

    await generator.run();
    console.log(`  ✓ ${target.name} (${target.routesDirectory} → ${target.generatedRouteTree})`);
  } catch (err) {
    console.error(`  ✗ Error generating routes for ${target.name}:`, err);
  }
}

console.log('✨ All route trees generated successfully!');
