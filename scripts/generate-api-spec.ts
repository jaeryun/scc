import { readFileSync, readdirSync, statSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname, relative, basename } from 'node:path';

const API_ROOT = 'src/app/api';

interface RouteInfo {
  path: string;
  methods: string[];
}

function walkDir(dir: string): string[] {
  const results: string[] = [];
  if (!existsSync(dir)) return results;

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDir(fullPath));
    } else if (entry.name === 'route.ts') {
      results.push(fullPath);
    }
  }
  return results;
}

function scanRoutes(): RouteInfo[] {
  const routeFiles = walkDir(API_ROOT);

  return routeFiles
    .map((file) => {
      const dir = dirname(file);
      const relFromApi = relative(API_ROOT, dir);
      const path = relFromApi ? `/${relFromApi}` : '';

      const content = readFileSync(file, 'utf-8');
      const methods: string[] = [];
      const regex = /export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE)\b/g;
      let match: RegExpExecArray | null;
      while ((match = regex.exec(content)) !== null) {
        methods.push(match[1]);
      }

      return { path, methods };
    })
    .filter((r) => r.methods.length > 0)
    .sort((a, b) => a.path.localeCompare(b.path));
}

function extractParams(path: string): string {
  return path.replace(/\[(\w+)\]/g, '{$1}');
}

function getTag(path: string): string {
  const segments = path.split('/').filter(Boolean);
  if (segments.length === 0) return 'root';
  return segments[0];
}

function scanTags(routes: RouteInfo[]): { name: string; description: string }[] {
  const tagSet = new Set(routes.map((r) => getTag(r.path)));
  return Array.from(tagSet).sort().map((name) => ({
    name,
    description: `${name.toUpperCase()} API endpoints`
  }));
}

function generateOpenApiSpec(routes: RouteInfo[]) {
  const tags = scanTags(routes);

  const spec = {
    openapi: '3.1.0',
    info: {
      title: 'SCC Internal API',
      version: '1.0.0',
      description:
        'SE Command Center production API endpoints.\nAuto-generated from src/app/api/ route handlers.'
    },
    tags,
    paths: {} as Record<string, Record<string, unknown>>
  };

  for (const route of routes) {
    const openApiPath = `/api${extractParams(route.path)}`;
    const pathObj: Record<string, unknown> = {};

    for (const method of route.methods) {
      pathObj[method.toLowerCase()] = {
        tags: [getTag(route.path)],
        summary: `${method} ${openApiPath}`,
        operationId: `${method.toLowerCase()}_${openApiPath.replace(/[\/{}]/g, '_').replace(/_+/g, '_')}`,
        responses: {
          '200': { description: 'Successful response' }
        }
      };
    }

    spec.paths[openApiPath] = pathObj;
  }

  return spec;
}

const routes = scanRoutes();
console.log(`Found ${routes.length} API route files:`);
for (const r of routes) {
  console.log(`  ${r.methods.join('|').padEnd(34)} ${r.path || '/'}`);
}

const spec = generateOpenApiSpec(routes);
const outputPath = 'public/api-specs/internal/latest.json';
const outputDir = dirname(outputPath);

if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

writeFileSync(outputPath, JSON.stringify(spec, null, 2));
console.log(`\nOpenAPI spec written to ${outputPath}`);
console.log(`  ${Object.keys(spec.paths).length} paths, ${spec.tags.length} tag groups`);
