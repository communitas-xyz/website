/**
 * network-scene.ts
 *
 * A living network graph behind the page content.
 *
 * Architecture (proven working):
 *   - Separate Points objects per node type (regular, bridge, peripheral)
 *   - Static initial graph with pre-computed edges
 *   - Per-cluster random drift direction + centroid attraction
 *   - Dynamic node/edge spawn and destroy with fade in/out
 *   - Scroll keeps network visible but increases churn rate
 *   - Mouse parallax on camera
 */

import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  BufferGeometry,
  Float32BufferAttribute,
  Points,
  ShaderMaterial,
  Color,
  Vector2,
} from 'three';
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';

// ---------------------------------------------------------------------------
// Seeded random
// ---------------------------------------------------------------------------

function seeded(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LiveNode {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  kind: 'regular' | 'hub' | 'bridge' | 'peripheral';
  cluster: number;
  size: number;
  baseOpacity: number;
  alive: boolean;
  age: number;
  fadeIn: number;
  dying: boolean;
  deathAge: number;
  fadeOut: number;
  // Index into the visual buffer for this node's type (-1 if not yet assigned)
  bufIdx: number;
}

interface LiveEdge {
  a: number;
  b: number;
  alive: boolean;
  age: number;
  fadeIn: number;
  dying: boolean;
  deathAge: number;
  fadeOut: number;
  bufIdx: number; // index into the edge visual buffer
  maxAge: number; // Infinity = permanent, finite = auto-sever after this many seconds
  highlight: number; // seconds of bright highlight color on creation (0 = none)
}

// ---------------------------------------------------------------------------
// Graph construction
// ---------------------------------------------------------------------------

const CLUSTERS = [
  { cx: -150, cy: 90, cz: -8, count: 11, spread: 60 },
  { cx: 140, cy: 50, cz: 6, count: 11, spread: 58 },
  { cx: -30, cy: -110, cz: -4, count: 10, spread: 52 },
];

const PERIPHERALS = [
  { x: -210, y: 160, z: -35 },
  { x: -90, y: 175, z: -28 },
  { x: 220, y: 120, z: -32 },
  { x: 210, y: -15, z: -30 },
  { x: 30, y: -180, z: -28 },
  { x: -150, y: -170, z: -38 },
  { x: 230, y: -90, z: -25 },
  { x: -230, y: -60, z: -30 },
];

interface GraphState {
  nodes: LiveNode[];
  edges: LiveEdge[];
  adj: number[][];
  clusterCount: number;
  clusterDrift: { dx: number; dy: number }[];
  clusterCenters: { x: number; y: number }[];
}

function buildGraph(rand: () => number): GraphState {
  const clusterCount = CLUSTERS.length;
  const nodes: LiveNode[] = [];
  const edges: LiveEdge[] = [];
  const ranges: [number, number][] = [];

  for (let ci = 0; ci < clusterCount; ci++) {
    const c = CLUSTERS[ci];
    const s = nodes.length;

    // Hub
    nodes.push({
      x: c.cx,
      y: c.cy,
      z: c.cz,
      vx: 0,
      vy: 0,
      kind: 'hub',
      cluster: ci,
      size: 7,
      baseOpacity: 1.0,
      alive: true,
      age: 10,
      fadeIn: 0.01,
      dying: false,
      deathAge: 0,
      fadeOut: 1.5,
      bufIdx: -1,
    });

    // Satellites
    for (let i = 1; i < c.count; i++) {
      const angle = ((i - 1) / (c.count - 1)) * Math.PI * 2 + (rand() - 0.5) * 0.6;
      const r = c.spread * (0.35 + rand() * 0.65);
      nodes.push({
        x: c.cx + Math.cos(angle) * r,
        y: c.cy + Math.sin(angle) * r,
        z: c.cz + (rand() - 0.5) * 18,
        vx: 0,
        vy: 0,
        kind: 'regular',
        cluster: ci,
        size: 4 + rand() * 3,
        baseOpacity: 0.6 + rand() * 0.4,
        alive: true,
        age: 10,
        fadeIn: 0.01,
        dying: false,
        deathAge: 0,
        fadeOut: 1.5,
        bufIdx: -1,
      });
    }
    ranges.push([s, nodes.length]);
  }

  // Bridge nodes
  const bridgeConfigs = [
    { x: -5, y: 78, z: 22, connects: [0, 1] },
    { x: 75, y: -35, z: 28, connects: [1, 2] },
    { x: -115, y: -10, z: 18, connects: [0, 2] },
  ];
  const bridgeIndices: number[] = [];
  for (const b of bridgeConfigs) {
    bridgeIndices.push(nodes.length);
    nodes.push({
      x: b.x,
      y: b.y,
      z: b.z,
      vx: 0,
      vy: 0,
      kind: 'bridge',
      cluster: -1,
      size: 10,
      baseOpacity: 1.0,
      alive: true,
      age: 10,
      fadeIn: 0.01,
      dying: false,
      deathAge: 0,
      fadeOut: 1.5,
      bufIdx: -1,
    });
  }

  // Peripherals
  for (const p of PERIPHERALS) {
    nodes.push({
      x: p.x,
      y: p.y,
      z: p.z,
      vx: 0,
      vy: 0,
      kind: 'peripheral',
      cluster: -1,
      size: 3,
      baseOpacity: 0.4,
      alive: true,
      age: 10,
      fadeIn: 0.01,
      dying: false,
      deathAge: 0,
      fadeOut: 2,
      bufIdx: -1,
    });
  }

  // Adjacency
  const adj: number[][] = nodes.map(() => []);

  function addEdge(a: number, b: number) {
    if (adj[a].includes(b)) return;
    edges.push({
      a,
      b,
      alive: true,
      age: 10,
      fadeIn: 0.01,
      dying: false,
      deathAge: 0,
      fadeOut: 1.0 + rand() * 0.5,
      bufIdx: -1,
      maxAge: Infinity,
      highlight: 0,
    });
    adj[a].push(b);
    adj[b].push(a);
  }

  // Intra-cluster edges
  for (let ci = 0; ci < clusterCount; ci++) {
    const [s, e] = ranges[ci];
    for (let i = s + 1; i < e; i++) if (rand() < 0.55) addEdge(s, i);
    for (let i = s + 1; i < e - 1; i++) if (rand() < 0.65) addEdge(i, i + 1);
    for (let i = s + 1; i < e; i++) for (let j = i + 2; j < e; j++) if (rand() < 0.1) addEdge(i, j);
  }

  // Bridge connections
  for (let bi = 0; bi < bridgeConfigs.length; bi++) {
    const bIdx = bridgeIndices[bi];
    const bn = nodes[bIdx];
    for (const ci of bridgeConfigs[bi].connects) {
      const [cs, ce] = ranges[ci];
      const candidates = Array.from({ length: ce - cs }, (_, i) => cs + i).sort(
        (a, b) =>
          Math.hypot(nodes[a].x - bn.x, nodes[a].y - bn.y) -
          Math.hypot(nodes[b].x - bn.x, nodes[b].y - bn.y),
      );
      for (let i = 0; i < Math.min(3, candidates.length); i++) addEdge(bIdx, candidates[i]);
    }
  }

  // Inter-bridge
  addEdge(bridgeIndices[0], bridgeIndices[1]);
  addEdge(bridgeIndices[1], bridgeIndices[2]);
  addEdge(bridgeIndices[0], bridgeIndices[2]);

  // Cluster drift directions
  const clusterDrift: { dx: number; dy: number }[] = [];
  for (let ci = 0; ci < clusterCount; ci++) {
    const angle = rand() * Math.PI * 2;
    clusterDrift.push({ dx: Math.cos(angle) * 30, dy: Math.sin(angle) * 30 });
  }

  return {
    nodes,
    edges,
    adj,
    clusterCount,
    clusterDrift,
    clusterCenters: recomputeCenters(nodes, clusterCount),
  };
}

function recomputeCenters(nodes: LiveNode[], clusterCount: number): { x: number; y: number }[] {
  const centers: { x: number; y: number }[] = [];
  for (let ci = 0; ci < clusterCount; ci++) {
    let sx = 0,
      sy = 0,
      count = 0;
    for (const n of nodes) {
      if (n.cluster === ci && n.alive && !n.dying) {
        sx += n.x;
        sy += n.y;
        count++;
      }
    }
    centers.push(
      count > 0 ? { x: sx / count, y: sy / count } : { x: CLUSTERS[ci].cx, y: CLUSTERS[ci].cy },
    );
  }
  return centers;
}

// ---------------------------------------------------------------------------
// Node shaders — procedural circle with white outline
//
// Two variants:
//   1. Vertex-color: fill from geometry 'color' attribute (regular, dynamic)
//   2. Uniform-color: fill from uColor * uOpacity uniform (bridge, peripheral)
//
// Outline brightness is derived from the fill color's max RGB channel so it
// naturally tracks fade-in/out without a separate alpha channel.
// ---------------------------------------------------------------------------

// Vertex-color variant: reads vec4 color attribute (rgb = tint, a = opacity)
const CIRCLE_VERT_COLOR = /* glsl */ `
  attribute vec4 color;
  varying vec3 vColor;
  varying float vAlpha;
  uniform float uSize;
  void main() {
    vColor = color.rgb;
    vAlpha = color.a;
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uSize * (300.0 / -mvPos.z);
    gl_Position = projectionMatrix * mvPos;
  }
`;

// Uniform-color variant: color + opacity from uniforms
const CIRCLE_VERT_UNIFORM = /* glsl */ `
  uniform float uSize;
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vColor = uColor;
    vAlpha = uOpacity;
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uSize * (300.0 / -mvPos.z);
    gl_Position = projectionMatrix * mvPos;
  }
`;

// Shared fragment: hard circle, white outline, proper alpha for opacity
const CIRCLE_FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  uniform float uOutlineWidth;
  uniform float uOutlineBoost;
  uniform float uBrightness;
  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    float innerR = 0.5 - uOutlineWidth;
    float outer = 1.0 - smoothstep(0.47, 0.5, dist);
    float ring = smoothstep(innerR - 0.02, innerR, dist);
    float brightness = max(vColor.r, max(vColor.g, vColor.b));
    vec3 outlineCol = vec3(min(1.0, brightness * uOutlineBoost));
    vec3 col = mix(vColor, outlineCol, ring) * uBrightness;
    gl_FragColor = vec4(col, outer * vAlpha);
  }
`;

function makeVCNodeMaterial(size: number, outlineWidth = 0.08, outlineBoost = 1.4): ShaderMaterial {
  return new ShaderMaterial({
    uniforms: {
      uSize: { value: size },
      uOutlineWidth: { value: outlineWidth },
      uOutlineBoost: { value: outlineBoost },
      uBrightness: { value: 0.85 },
    },
    vertexShader: CIRCLE_VERT_COLOR,
    fragmentShader: CIRCLE_FRAG,
    transparent: true,
    depthWrite: false,
    depthTest: false,
  });
}

function makeUniformNodeMaterial(
  size: number,
  color: Color,
  opacity: number,
  outlineWidth = 0.08,
  outlineBoost = 1.4,
): ShaderMaterial {
  return new ShaderMaterial({
    uniforms: {
      uSize: { value: size },
      uColor: { value: color.clone() },
      uOpacity: { value: opacity },
      uOutlineWidth: { value: outlineWidth },
      uOutlineBoost: { value: outlineBoost },
      uBrightness: { value: 0.85 },
    },
    vertexShader: CIRCLE_VERT_UNIFORM,
    fragmentShader: CIRCLE_FRAG,
    transparent: true,
    depthWrite: false,
    depthTest: false,
  });
}

// ---------------------------------------------------------------------------
// Theme — brighter colors
// ---------------------------------------------------------------------------

interface Palette {
  clusterTints: Color[];
  bridge: Color;
  edge: Color;
  bridgeEdge: Color;
  peripheral: Color;
  edgeHighlight: Color;
}

function palette(): Palette {
  const dark =
    document.documentElement.getAttribute('data-theme') === 'dark' ||
    (!document.documentElement.getAttribute('data-theme') &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  return dark
    ? {
        clusterTints: [new Color('#aabbee'), new Color('#ccaaee'), new Color('#88ddcc')],
        bridge: new Color('#a5b4fc'),
        edge: new Color('#d4d4d8'),
        bridgeEdge: new Color('#a5b4fc'),
        peripheral: new Color('#a1a1aa'),
        edgeHighlight: new Color('#ffffff'),
      }
    : {
        clusterTints: [new Color('#4466aa'), new Color('#7744aa'), new Color('#228877')],
        bridge: new Color('#6366f1'),
        edge: new Color('#71717a'),
        bridgeEdge: new Color('#6366f1'),
        peripheral: new Color('#a1a1aa'),
        edgeHighlight: new Color('#e0e7ff'),
      };
}

// ---------------------------------------------------------------------------
// Scene
// ---------------------------------------------------------------------------

let renderer: WebGLRenderer | null = null;
let frameId: number | null = null;
let dead = false;

export function init(container: HTMLElement) {
  dead = false;
  const rand = seeded(42);
  const G = buildGraph(rand);
  let pal = palette();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Renderer ---
  const canvas = document.createElement('canvas');
  container.appendChild(canvas);
  renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const camera = new PerspectiveCamera(32, 1, 1, 1200);
  camera.position.set(0, 0, 500);

  const scene = new Scene();
  const mouse = new Vector2(0, 0);
  const smooth = new Vector2(0, 0);

  // All LineMaterials need viewport resolution for screen-space line width
  const lineMaterials: LineMaterial[] = [];

  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    renderer!.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    for (const m of lineMaterials) m.resolution.set(w, h);
  }

  // ------------------------------------------------------------------
  // Visuals — separate Points per type, exact-sized buffers
  // ------------------------------------------------------------------

  // Classify initial nodes
  const regularIdx: number[] = [];
  const bridgeIdx: number[] = [];
  const peripheralIdx: number[] = [];
  for (let i = 0; i < G.nodes.length; i++) {
    const n = G.nodes[i];
    if (n.kind === 'bridge') bridgeIdx.push(i);
    else if (n.kind === 'peripheral') peripheralIdx.push(i);
    else regularIdx.push(i);
  }

  // --- Regular nodes (vertex colors: RGBA = tint + opacity) ---
  const regCount = regularIdx.length;
  const regPos = new Float32Array(regCount * 3);
  const regCol = new Float32Array(regCount * 4);

  for (let i = 0; i < regCount; i++) {
    const n = G.nodes[regularIdx[i]];
    n.bufIdx = i;
    regPos[i * 3] = n.x;
    regPos[i * 3 + 1] = n.y;
    regPos[i * 3 + 2] = n.z;
    const tint = n.cluster >= 0 ? pal.clusterTints[n.cluster] : pal.edge;
    regCol[i * 4] = tint.r;
    regCol[i * 4 + 1] = tint.g;
    regCol[i * 4 + 2] = tint.b;
    regCol[i * 4 + 3] = n.baseOpacity;
  }

  const regGeo = new BufferGeometry();
  regGeo.setAttribute('position', new Float32BufferAttribute(regPos, 3));
  regGeo.setAttribute('color', new Float32BufferAttribute(regCol, 4));
  const regMat = makeVCNodeMaterial(20);
  const regPoints = new Points(regGeo, regMat);
  regPoints.renderOrder = 1;
  scene.add(regPoints);

  // --- Bridge nodes ---
  const bCount = bridgeIdx.length;
  const bPos = new Float32Array(bCount * 3);
  for (let i = 0; i < bCount; i++) {
    const n = G.nodes[bridgeIdx[i]];
    n.bufIdx = i;
    bPos[i * 3] = n.x;
    bPos[i * 3 + 1] = n.y;
    bPos[i * 3 + 2] = n.z;
  }
  const bGeo = new BufferGeometry();
  bGeo.setAttribute('position', new Float32BufferAttribute(bPos, 3));
  const bMat = makeUniformNodeMaterial(48, pal.bridge, 1.0, 0.06);
  const bPoints = new Points(bGeo, bMat);
  bPoints.renderOrder = 1;
  scene.add(bPoints);

  // --- Peripheral nodes ---
  const pCount = peripheralIdx.length;
  const pPos = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) {
    const n = G.nodes[peripheralIdx[i]];
    n.bufIdx = i;
    pPos[i * 3] = n.x;
    pPos[i * 3 + 1] = n.y;
    pPos[i * 3 + 2] = n.z;
  }
  const pGeo = new BufferGeometry();
  pGeo.setAttribute('position', new Float32BufferAttribute(pPos, 3));
  const pMat = makeUniformNodeMaterial(14, pal.peripheral, 0.5);
  const pPoints = new Points(pGeo, pMat);
  pPoints.renderOrder = 1;
  scene.add(pPoints);

  // --- Edges ---
  const bridgeSet = new Set(bridgeIdx);
  const regEdgePairs: [number, number][] = [];
  const bridgeEdgePairs: [number, number][] = [];
  for (let i = 0; i < G.edges.length; i++) {
    const e = G.edges[i];
    if (bridgeSet.has(e.a) || bridgeSet.has(e.b)) {
      e.bufIdx = bridgeEdgePairs.length;
      bridgeEdgePairs.push([e.a, e.b]);
    } else {
      e.bufIdx = regEdgePairs.length;
      regEdgePairs.push([e.a, e.b]);
    }
  }

  // --- Static edges — fat lines via LineSegments2 ---
  const regEdgePos = new Float32Array(regEdgePairs.length * 6);
  const regEdgeGeo = new LineSegmentsGeometry();
  regEdgeGeo.setPositions(regEdgePos);
  const regEdgeMat = new LineMaterial({
    color: pal.edge.getHex(),
    transparent: true,
    opacity: 0.2,
    depthWrite: false,
    linewidth: 2,
    worldUnits: false,
  });
  lineMaterials.push(regEdgeMat);
  scene.add(new LineSegments2(regEdgeGeo, regEdgeMat));

  const bridgeEdgePos = new Float32Array(bridgeEdgePairs.length * 6);
  const bridgeEdgeGeo = new LineSegmentsGeometry();
  bridgeEdgeGeo.setPositions(bridgeEdgePos);
  const bridgeEdgeMat = new LineMaterial({
    color: pal.bridgeEdge.getHex(),
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
    linewidth: 3,
    worldUnits: false,
  });
  lineMaterials.push(bridgeEdgeMat);
  scene.add(new LineSegments2(bridgeEdgeGeo, bridgeEdgeMat));

  // --- Dynamic nodes: a separate Points for spawned nodes ---
  // We allocate a fixed buffer and track count with drawRange
  const MAX_DYNAMIC = 150;
  const dynPos = new Float32Array(MAX_DYNAMIC * 3);
  const dynCol = new Float32Array(MAX_DYNAMIC * 4);
  const dynGeo = new BufferGeometry();
  dynGeo.setAttribute('position', new Float32BufferAttribute(dynPos, 3));
  dynGeo.setAttribute('color', new Float32BufferAttribute(dynCol, 4));
  dynGeo.setDrawRange(0, 0);
  const dynMat = makeVCNodeMaterial(17);
  const dynPoints = new Points(dynGeo, dynMat);
  dynPoints.renderOrder = 1;
  scene.add(dynPoints);

  // --- Dynamic edges: fat lines with vertex colors ---
  const MAX_DYN_EDGES = 400;
  const dynEdgePos = new Float32Array(MAX_DYN_EDGES * 6);
  const dynEdgeCol = new Float32Array(MAX_DYN_EDGES * 6);
  const dynEdgeGeo = new LineSegmentsGeometry();
  dynEdgeGeo.setPositions(dynEdgePos);
  dynEdgeGeo.setColors(dynEdgeCol);
  dynEdgeGeo.instanceCount = 0;
  const dynEdgeMat = new LineMaterial({
    transparent: true,
    opacity: 1,
    vertexColors: true,
    depthWrite: false,
    linewidth: 2,
    worldUnits: false,
  });
  lineMaterials.push(dynEdgeMat);
  scene.add(new LineSegments2(dynEdgeGeo, dynEdgeMat));

  // Track dynamic (spawned) nodes/edges separately
  const dynNodes: number[] = []; // indices into G.nodes
  const dynEdges: number[] = []; // indices into G.edges

  // ------------------------------------------------------------------
  // Update edge positions
  // ------------------------------------------------------------------

  // Get references to the interleaved buffers inside LineSegmentsGeometry
  // Layout: [x1,y1,z1, x2,y2,z2] per segment (stride 6), stored as
  // instanceStart (offset 0) and instanceEnd (offset 3).
  function getInterleavedArray(geo: LineSegmentsGeometry): Float32Array {
    const attr = geo.getAttribute('instanceStart');
    return (attr as unknown as { data: { array: Float32Array } }).data.array;
  }

  function markInterleavedDirty(geo: LineSegmentsGeometry) {
    const attr = geo.getAttribute('instanceStart');
    (attr as unknown as { data: { needsUpdate: boolean } }).data.needsUpdate = true;
  }

  const regEdgeBuf = getInterleavedArray(regEdgeGeo);
  const bridgeEdgeBuf = getInterleavedArray(bridgeEdgeGeo);

  function updateEdgePositions() {
    for (let i = 0; i < regEdgePairs.length; i++) {
      const [a, b] = regEdgePairs[i];
      const na = G.nodes[a];
      const nb = G.nodes[b];
      const off = i * 6;
      regEdgeBuf[off] = na.x;
      regEdgeBuf[off + 1] = na.y;
      regEdgeBuf[off + 2] = na.z;
      regEdgeBuf[off + 3] = nb.x;
      regEdgeBuf[off + 4] = nb.y;
      regEdgeBuf[off + 5] = nb.z;
    }
    markInterleavedDirty(regEdgeGeo);

    for (let i = 0; i < bridgeEdgePairs.length; i++) {
      const [a, b] = bridgeEdgePairs[i];
      const na = G.nodes[a];
      const nb = G.nodes[b];
      const off = i * 6;
      bridgeEdgeBuf[off] = na.x;
      bridgeEdgeBuf[off + 1] = na.y;
      bridgeEdgeBuf[off + 2] = na.z;
      bridgeEdgeBuf[off + 3] = nb.x;
      bridgeEdgeBuf[off + 4] = nb.y;
      bridgeEdgeBuf[off + 5] = nb.z;
    }
    markInterleavedDirty(bridgeEdgeGeo);
  }

  // ------------------------------------------------------------------
  // Physics — edge-based force-directed layout
  //
  // Each node is attracted toward the centroid of its live connected
  // neighbors (PRIMARY).  A weaker pull toward the cluster centroid
  // acts as background gravity to prevent scatter when edges are few.
  // Per-cluster drift gives macro movement.
  //
  // Adding a cross-cluster edge shifts the neighbor centroid toward
  // the distant node, pulling both endpoints together.  Their local
  // neighbors follow because *their* centroids update next frame.
  // When the edge severs and is cleaned from G.adj, the distant node
  // drops out — remaining (mostly same-cluster) neighbors dominate,
  // pulling the node back home.
  // ------------------------------------------------------------------

  const EDGE_ATTRACT = 1.5;
  const CLUSTER_ATTRACT = 0.5;
  const DAMPING = 0.88;
  let driftTimer = 0;
  const DRIFT_ROTATE_INTERVAL = 5;

  function stepPhysics(dt: number) {
    for (let ni = 0; ni < G.nodes.length; ni++) {
      const n = G.nodes[ni];
      if (!n.alive || n.dying) continue;

      // Bridge / peripheral — only edge attraction + gentle damping
      if (n.cluster < 0) {
        const neighbors = G.adj[ni];
        if (neighbors && neighbors.length > 0) {
          let nx = 0,
            ny = 0,
            count = 0;
          for (const j of neighbors) {
            const nb = G.nodes[j];
            if (nb && nb.alive && !nb.dying) {
              nx += nb.x;
              ny += nb.y;
              count++;
            }
          }
          if (count > 0) {
            const toNX = nx / count - n.x;
            const toNY = ny / count - n.y;
            const d = Math.sqrt(toNX * toNX + toNY * toNY);
            if (d > 5) {
              n.vx += toNX * EDGE_ATTRACT * 0.3 * dt;
              n.vy += toNY * EDGE_ATTRACT * 0.3 * dt;
            }
          }
        }
        n.x += n.vx * dt;
        n.y += n.vy * dt;
        n.vx *= 0.98;
        n.vy *= 0.98;
        continue;
      }

      // Cluster drift (macro movement)
      const drift = G.clusterDrift[n.cluster];

      // Edge-based neighbor attraction (PRIMARY force)
      const neighbors = G.adj[ni];
      let edgeFx = 0,
        edgeFy = 0;
      if (neighbors && neighbors.length > 0) {
        let ncx = 0,
          ncy = 0,
          ncount = 0;
        for (const j of neighbors) {
          const nb = G.nodes[j];
          if (nb && nb.alive && !nb.dying) {
            ncx += nb.x;
            ncy += nb.y;
            ncount++;
          }
        }
        if (ncount > 0) {
          const toNX = ncx / ncount - n.x;
          const toNY = ncy / ncount - n.y;
          const d = Math.sqrt(toNX * toNX + toNY * toNY);
          if (d > 5) {
            const ef = EDGE_ATTRACT * (d / 60);
            edgeFx = toNX * ef;
            edgeFy = toNY * ef;
          }
        }
      }

      // Cluster centroid attraction (WEAK background gravity)
      const center = G.clusterCenters[n.cluster];
      const toCX = center.x - n.x;
      const toCY = center.y - n.y;
      const cDist = Math.sqrt(toCX * toCX + toCY * toCY);
      const cf = cDist > 10 ? CLUSTER_ATTRACT * (cDist / 80) : 0;

      n.vx += (drift.dx + edgeFx + toCX * cf) * dt;
      n.vy += (drift.dy + edgeFy + toCY * cf) * dt;
      n.vx *= DAMPING;
      n.vy *= DAMPING;
      n.x += n.vx * dt;
      n.y += n.vy * dt;
    }

    G.clusterCenters = recomputeCenters(G.nodes, G.clusterCount);

    driftTimer += dt;
    if (driftTimer > DRIFT_ROTATE_INTERVAL) {
      driftTimer = 0;
      for (let ci = 0; ci < G.clusterCount; ci++) {
        const a = (rand() - 0.5) * Math.PI * 0.6;
        const cos = Math.cos(a);
        const sin = Math.sin(a);
        const d = G.clusterDrift[ci];
        const nx = d.dx * cos - d.dy * sin;
        const ny = d.dx * sin + d.dy * cos;
        d.dx = nx;
        d.dy = ny;
      }
    }
  }

  // ------------------------------------------------------------------
  // Spawn / destroy
  // ------------------------------------------------------------------

  let spawnAccum = 0;
  let destroyAccum = 0;
  const BASE_SPAWN_INTERVAL = 0.8;
  const BASE_DESTROY_INTERVAL = 1.2;
  const SCROLL_CHURN_MULT = 10;

  function spawnNode() {
    if (dynNodes.length >= MAX_DYNAMIC) return;

    // Pick cluster (smaller clusters more likely)
    const sizes = new Array(G.clusterCount).fill(0);
    for (const n of G.nodes) if (n.cluster >= 0 && n.alive && !n.dying) sizes[n.cluster]++;
    const maxS = Math.max(...sizes, 1);
    const weights = sizes.map((s: number) => maxS - s + 1);
    const total = weights.reduce((a: number, b: number) => a + b, 0);
    let r = rand() * total;
    let ci = 0;
    for (let i = 0; i < weights.length; i++) {
      r -= weights[i];
      if (r <= 0) {
        ci = i;
        break;
      }
    }

    const center = G.clusterCenters[ci];
    const angle = rand() * Math.PI * 2;
    const dist = 25 + rand() * 45;
    const idx = G.nodes.length;

    G.nodes.push({
      x: center.x + Math.cos(angle) * dist,
      y: center.y + Math.sin(angle) * dist,
      z: (rand() - 0.5) * 18,
      vx: 0,
      vy: 0,
      kind: 'regular',
      cluster: ci,
      size: 4 + rand() * 3,
      baseOpacity: 0.5 + rand() * 0.5,
      alive: true,
      age: 0,
      fadeIn: 0.4 + rand() * 0.4,
      dying: false,
      deathAge: 0,
      fadeOut: 0.6 + rand() * 0.4,
      bufIdx: dynNodes.length,
    });
    G.adj.push([]);
    dynNodes.push(idx);

    // Connect to 2-4 nearby same-cluster nodes
    const nearby = G.nodes
      .map((n, i) => ({ n, i }))
      .filter(({ n, i }) => n.cluster === ci && n.alive && !n.dying && i !== idx)
      .sort(
        (a, b) =>
          Math.hypot(a.n.x - G.nodes[idx].x, a.n.y - G.nodes[idx].y) -
          Math.hypot(b.n.x - G.nodes[idx].x, b.n.y - G.nodes[idx].y),
      );

    const edgeCount = 2 + Math.floor(rand() * 3);
    for (let i = 0; i < Math.min(edgeCount, nearby.length); i++) {
      if (dynEdges.length >= MAX_DYN_EDGES) break;
      const other = nearby[i].i;
      if (G.adj[idx].includes(other)) continue;
      const eIdx = G.edges.length;
      G.edges.push({
        a: idx,
        b: other,
        alive: true,
        age: 0,
        fadeIn: 0.3 + rand() * 0.3,
        dying: false,
        deathAge: 0,
        fadeOut: 0.5 + rand() * 0.3,
        maxAge: Infinity,
        highlight: 1.5,
        bufIdx: dynEdges.length,
      });
      G.adj[idx].push(other);
      G.adj[other].push(idx);
      dynEdges.push(eIdx);
    }
  }

  function killRandomNode() {
    // Pick a live non-hub dynamic-ish node
    const candidates = G.nodes
      .map((n, i) => ({ n, i }))
      .filter(({ n }) => n.alive && !n.dying && n.age > 3 && n.kind === 'regular');
    if (candidates.length <= 5) return; // keep minimum population
    candidates.sort((a, b) => b.n.age - a.n.age);
    const pick = candidates[Math.floor(rand() * Math.min(8, candidates.length))];
    const n = pick.n;
    n.dying = true;
    n.deathAge = n.age;
    // Mark edges dying too
    for (const e of G.edges) {
      if ((e.a === pick.i || e.b === pick.i) && e.alive && !e.dying) {
        e.dying = true;
        e.deathAge = e.age;
      }
    }
  }

  // ------------------------------------------------------------------
  // Random cross-cluster edges
  //
  // Periodically link two nodes from different clusters. The edge-based
  // physics pulls both endpoints (and their neighbors) together. When
  // the edge's maxAge expires it severs, adjacency is cleaned, and
  // nodes drift back toward their remaining connections.
  // ------------------------------------------------------------------

  let randomEdgeAccum = 0;
  const BASE_RANDOM_EDGE_INTERVAL = 2.5;

  function spawnRandomEdge() {
    if (dynEdges.length >= MAX_DYN_EDGES) return;

    // Collect alive non-dying clustered nodes
    const alive: { idx: number; cluster: number }[] = [];
    for (let i = 0; i < G.nodes.length; i++) {
      const n = G.nodes[i];
      if (n.alive && !n.dying && n.cluster >= 0) {
        alive.push({ idx: i, cluster: n.cluster });
      }
    }
    if (alive.length < 2) return;

    // Pick first node randomly
    const a = alive[Math.floor(rand() * alive.length)];

    // Pick second node from a DIFFERENT cluster
    const candidates = alive.filter((b) => b.cluster !== a.cluster);
    if (candidates.length === 0) return;
    const b = candidates[Math.floor(rand() * candidates.length)];

    // Skip if already connected
    if (G.adj[a.idx] && G.adj[a.idx].includes(b.idx)) return;

    const eIdx = G.edges.length;
    G.edges.push({
      a: a.idx,
      b: b.idx,
      alive: true,
      age: 0,
      fadeIn: 0.5 + rand() * 0.5,
      dying: false,
      deathAge: 0,
      fadeOut: 1.0 + rand() * 0.5,
      maxAge: 6 + rand() * 8,
      highlight: 2.0,
      bufIdx: dynEdges.length,
    });
    if (!G.adj[a.idx]) G.adj[a.idx] = [];
    if (!G.adj[b.idx]) G.adj[b.idx] = [];
    G.adj[a.idx].push(b.idx);
    G.adj[b.idx].push(a.idx);
    dynEdges.push(eIdx);
  }

  // ------------------------------------------------------------------
  // Sync GPU buffers
  // ------------------------------------------------------------------

  function syncPositions() {
    // Static nodes
    const regPosAttr = regGeo.getAttribute('position');
    for (let i = 0; i < regCount; i++) {
      const n = G.nodes[regularIdx[i]];
      regPosAttr.setXYZ(i, n.x, n.y, n.z);
    }
    regPosAttr.needsUpdate = true;

    const bPosAttr = bGeo.getAttribute('position');
    for (let i = 0; i < bCount; i++) {
      const n = G.nodes[bridgeIdx[i]];
      bPosAttr.setXYZ(i, n.x, n.y, n.z);
    }
    bPosAttr.needsUpdate = true;

    const pPosAttr = pGeo.getAttribute('position');
    for (let i = 0; i < pCount; i++) {
      const n = G.nodes[peripheralIdx[i]];
      pPosAttr.setXYZ(i, n.x, n.y, n.z);
    }
    pPosAttr.needsUpdate = true;

    updateEdgePositions();

    // Dynamic nodes — write positions and colors (with fade)
    let visibleDyn = 0;
    for (const ni of dynNodes) {
      const n = G.nodes[ni];
      if (!n.alive) continue;
      let alpha = n.baseOpacity;
      if (n.age < n.fadeIn) alpha *= n.age / n.fadeIn;
      if (n.dying) {
        const p = (n.age - n.deathAge) / n.fadeOut;
        if (p >= 1) {
          n.alive = false;
          // Clean adjacency — remove this node from all neighbor lists
          if (G.adj[ni]) {
            for (const neighbor of G.adj[ni]) {
              if (G.adj[neighbor]) {
                G.adj[neighbor] = G.adj[neighbor].filter((x) => x !== ni);
              }
            }
            G.adj[ni] = [];
          }
          continue;
        }
        alpha *= 1 - p;
      }
      if (alpha < 0.01) continue;

      const tint =
        n.cluster >= 0 && n.cluster < pal.clusterTints.length
          ? pal.clusterTints[n.cluster]
          : pal.edge;
      const pOff = visibleDyn * 3;
      dynPos[pOff] = n.x;
      dynPos[pOff + 1] = n.y;
      dynPos[pOff + 2] = n.z;
      const cOff = visibleDyn * 4;
      dynCol[cOff] = tint.r;
      dynCol[cOff + 1] = tint.g;
      dynCol[cOff + 2] = tint.b;
      dynCol[cOff + 3] = alpha;
      visibleDyn++;
    }
    dynGeo.getAttribute('position').needsUpdate = true;
    dynGeo.getAttribute('color').needsUpdate = true;
    dynGeo.setDrawRange(0, visibleDyn);

    // Dynamic edges — write positions and colors into interleaved buffers
    const dynEdgePosBuf = getInterleavedArray(dynEdgeGeo);
    let dynEdgeColBuf: Float32Array | null = null;
    {
      const colAttr = dynEdgeGeo.getAttribute('instanceColorStart');
      if (colAttr) {
        dynEdgeColBuf = (colAttr as unknown as { data: { array: Float32Array } }).data.array;
      }
    }
    let visibleDynEdges = 0;
    for (const ei of dynEdges) {
      const e = G.edges[ei];
      if (!e.alive) continue;
      const na = G.nodes[e.a];
      const nb = G.nodes[e.b];
      if (!na || !nb) continue;

      let alpha = 0.25;
      if (e.age < e.fadeIn) alpha *= e.age / e.fadeIn;
      if (e.dying) {
        const p = (e.age - e.deathAge) / e.fadeOut;
        if (p >= 1) {
          e.alive = false;
          // Clean adjacency — sever the connection so physics stops pulling
          if (G.adj[e.a]) G.adj[e.a] = G.adj[e.a].filter((x) => x !== e.b);
          if (G.adj[e.b]) G.adj[e.b] = G.adj[e.b].filter((x) => x !== e.a);
          continue;
        }
        alpha *= 1 - p;
      }
      if (alpha < 0.01) continue;

      const off = visibleDynEdges * 6;
      dynEdgePosBuf[off] = na.x;
      dynEdgePosBuf[off + 1] = na.y;
      dynEdgePosBuf[off + 2] = na.z;
      dynEdgePosBuf[off + 3] = nb.x;
      dynEdgePosBuf[off + 4] = nb.y;
      dynEdgePosBuf[off + 5] = nb.z;

      // Highlight color: bright on creation, fading to normal edge color
      if (dynEdgeColBuf) {
        let cr: number, cg: number, cb: number;
        if (e.highlight > 0 && e.age < e.highlight) {
          const t = e.age / e.highlight; // 0 → 1 over highlight duration
          const hl = pal.edgeHighlight;
          const nl = pal.edge;
          cr = hl.r * (1 - t) + nl.r * t;
          cg = hl.g * (1 - t) + nl.g * t;
          cb = hl.b * (1 - t) + nl.b * t;
        } else {
          cr = pal.edge.r;
          cg = pal.edge.g;
          cb = pal.edge.b;
        }
        dynEdgeColBuf[off] = cr * alpha;
        dynEdgeColBuf[off + 1] = cg * alpha;
        dynEdgeColBuf[off + 2] = cb * alpha;
        dynEdgeColBuf[off + 3] = cr * alpha;
        dynEdgeColBuf[off + 4] = cg * alpha;
        dynEdgeColBuf[off + 5] = cb * alpha;
      }
      visibleDynEdges++;
    }
    markInterleavedDirty(dynEdgeGeo);
    if (dynEdgeColBuf) {
      const colAttr = dynEdgeGeo.getAttribute('instanceColorStart');
      if (colAttr) {
        (colAttr as unknown as { data: { needsUpdate: boolean } }).data.needsUpdate = true;
      }
    }
    dynEdgeGeo.instanceCount = visibleDynEdges;
  }

  // ------------------------------------------------------------------
  // Animate
  // ------------------------------------------------------------------

  resize();
  const rObs = new ResizeObserver(() => resize());
  rObs.observe(container);
  window.addEventListener('mousemove', (e: MouseEvent) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  syncPositions();
  renderer.render(scene, camera);
  if (reducedMotion) return;

  let prevTime = -1;

  function animate(time: number) {
    if (dead) return;
    frameId = requestAnimationFrame(animate);

    const t = time * 0.001;
    const dt = prevTime < 0 ? 0.016 : Math.min(t - prevTime, 0.1);
    prevTime = t;

    // Scroll: dims from CSS base opacity, increases churn
    const scrollFraction = Math.min(1, window.scrollY / (window.innerHeight * 2));
    const BASE_OPACITY = 0.4;
    const opacity = BASE_OPACITY * (1 - scrollFraction * 0.5);
    container.style.opacity = String(opacity);
    const churn = 1 + scrollFraction * SCROLL_CHURN_MULT;

    // Mouse parallax
    smooth.x += (mouse.x - smooth.x) * 0.04;
    smooth.y += (mouse.y - smooth.y) * 0.04;
    camera.position.x = smooth.x * 30;
    camera.position.y = smooth.y * 22;
    camera.lookAt(0, 0, 0);

    // Age everything
    for (const n of G.nodes) if (n.alive) n.age += dt;
    for (const e of G.edges) if (e.alive) e.age += dt;

    // Edge lifespan — auto-sever edges that exceed their maxAge
    for (const e of G.edges) {
      if (e.alive && !e.dying && e.maxAge < Infinity && e.age >= e.maxAge) {
        e.dying = true;
        e.deathAge = e.age;
      }
    }

    // Physics
    stepPhysics(dt);

    // Spawn/destroy with scroll-driven churn
    spawnAccum += dt * churn;
    while (spawnAccum >= BASE_SPAWN_INTERVAL) {
      spawnAccum -= BASE_SPAWN_INTERVAL;
      spawnNode();
    }

    destroyAccum += dt * churn;
    while (destroyAccum >= BASE_DESTROY_INTERVAL) {
      destroyAccum -= BASE_DESTROY_INTERVAL;
      killRandomNode();
    }

    // Random cross-cluster edges (scroll-accelerated)
    randomEdgeAccum += dt * churn;
    while (randomEdgeAccum >= BASE_RANDOM_EDGE_INTERVAL) {
      randomEdgeAccum -= BASE_RANDOM_EDGE_INTERVAL;
      spawnRandomEdge();
    }

    // Sync to GPU
    syncPositions();

    renderer!.render(scene, camera);
  }

  frameId = requestAnimationFrame(animate);

  // --- Theme changes ---
  const mObs = new MutationObserver(() => {
    pal = palette();
    bMat.uniforms.uColor.value.copy(pal.bridge);
    pMat.uniforms.uColor.value.copy(pal.peripheral);
    regEdgeMat.color.set(pal.edge);
    bridgeEdgeMat.color.set(pal.bridgeEdge);
    for (let i = 0; i < regCount; i++) {
      const n = G.nodes[regularIdx[i]];
      const tint = n.cluster >= 0 ? pal.clusterTints[n.cluster] : pal.edge;
      regCol[i * 4] = tint.r;
      regCol[i * 4 + 1] = tint.g;
      regCol[i * 4 + 2] = tint.b;
      regCol[i * 4 + 3] = n.baseOpacity;
    }
    regGeo.getAttribute('color').needsUpdate = true;
  });
  mObs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  // --- Cleanup ---
  return () => {
    dead = true;
    if (frameId !== null) cancelAnimationFrame(frameId);
    rObs.disconnect();
    mObs.disconnect();
    regGeo.dispose();
    bGeo.dispose();
    pGeo.dispose();
    dynGeo.dispose();
    dynEdgeGeo.dispose();
    regEdgeGeo.dispose();
    bridgeEdgeGeo.dispose();
    regMat.dispose();
    bMat.dispose();
    pMat.dispose();
    dynMat.dispose();
    dynEdgeMat.dispose();
    regEdgeMat.dispose();
    bridgeEdgeMat.dispose();
    renderer?.dispose();
    renderer = null;
    canvas.remove();
  };
}

export function destroy() {
  dead = true;
  if (frameId !== null) {
    cancelAnimationFrame(frameId);
    frameId = null;
  }
  renderer?.dispose();
  renderer = null;
}
