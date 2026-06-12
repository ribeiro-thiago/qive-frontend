/**
 * Minimal Figma tokens extractor
 * - Reads FIGMA_TOKEN and FIGMA_FILE_KEY from env
 * - Tries variables endpoint first, falls back to file styles
 * - Writes JSON to design/tokens.json
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const FIGMA_TOKEN = process.env.FIGMA_TOKEN || process.env.FIGMA_PERSONAL_TOKEN;
const FILE_KEY = process.env.FIGMA_FILE_KEY || process.env.FIGMA_FILEID || process.env.FIGMA_FILE_KEY_ID;

if (!FIGMA_TOKEN || !FILE_KEY) {
  console.error('Missing FIGMA_TOKEN or FIGMA_FILE_KEY in env');
  process.exit(1);
}

const headers = { 'X-Figma-Token': FIGMA_TOKEN };

async function fetchJson(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${url}`);
  return res.json();
}

function rgbToHex({ r, g, b }) {
  const to = (x) => Math.round(Math.min(255, Math.max(0, x * 255)));
  const hex = (n) => n.toString(16).padStart(2, '0');
  return `#${hex(to(r))}${hex(to(g))}${hex(to(b))}`.toUpperCase();
}

async function extractVariables() {
  const url = `https://api.figma.com/v1/files/${FILE_KEY}/variables/local`;
  const json = await fetchJson(url);
  const out = { colors: {}, raw: json };
  for (const v of json.variables || []) {
    if (v.resolvedType !== 'COLOR') continue;
    // pick value from first mode
    const first = Object.values(v.valuesByMode || {})[0];
    if (!first || !first.r || first.type === 'VARIABLE_ALIAS') continue;
    out.colors[v.name] = rgbToHex(first);
  }
  return out;
}

async function extractStyles() {
  // Fallback: fetch full file and walk for PAINT styles.
  const url = `https://api.figma.com/v1/files/${FILE_KEY}`;
  const json = await fetchJson(url);
  const styleById = json.styles || {};
  const colors = {};

  function visit(node) {
    const fills = node.fills || node.style?.fills;
    if (Array.isArray(fills)) {
      for (const f of fills) {
        if (f.type === 'SOLID' && f.color) {
          const hex = rgbToHex(f.color);
          if (node.styles?.fill) {
            const style = styleById[node.styles.fill];
            if (style?.styleType === 'FILL') colors[style.name] = hex;
          }
        }
      }
    }
    if (node.children) node.children.forEach(visit);
  }

  visit(json.document);
  return { colors, raw: { styles: styleById } };
}

async function main() {
  let tokens;
  try {
    tokens = await extractVariables();
  } catch (e) {
    console.warn('Variables endpoint failed, falling back to styles:', e.message);
    tokens = await extractStyles();
  }
  const outDir = path.join(process.cwd(), 'design');
  await fs.mkdir(outDir, { recursive: true });
  const outFile = path.join(outDir, 'tokens.json');
  await fs.writeFile(outFile, JSON.stringify(tokens, null, 2));
  console.log('Wrote tokens to', outFile);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

