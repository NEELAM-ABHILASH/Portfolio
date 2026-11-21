/**
 * Point-cloud generators — one per portfolio section. The particle field
 * morphs between these as the visitor scrolls (order matches `sections`).
 */

type Gen = (n: number) => Float32Array;

const TAU = Math.PI * 2;
const r = (a: number, b: number) => a + Math.random() * (b - a);

function rotateX(arr: Float32Array, angle: number) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  for (let i = 0; i < arr.length; i += 3) {
    const y = arr[i + 1];
    const z = arr[i + 2];
    arr[i + 1] = y * c - z * s;
    arr[i + 2] = y * s + z * c;
  }
  return arr;
}

/** Home — a planet with a tilted debris ring. */
const planet: Gen = (n) => {
  const out = new Float32Array(n * 3);
  const shell = Math.floor(n * 0.58);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    let x: number, y: number, z: number;
    if (i < shell) {
      const yy = 1 - (i / (shell - 1)) * 2;
      const rad = Math.sqrt(1 - yy * yy);
      const th = golden * i;
      const R = 1.9 + r(-0.04, 0.04);
      x = Math.cos(th) * rad * R;
      y = yy * R;
      z = Math.sin(th) * rad * R;
    } else {
      const a = r(0, TAU);
      const R = Math.pow(Math.random(), 0.7) * 1.1 + 2.6;
      x = Math.cos(a) * R;
      y = r(-0.05, 0.05);
      z = Math.sin(a) * R;
    }
    out.set([x, y, z], i * 3);
  }
  return rotateX(out, 0.42);
};

/** About — a (2,3) torus knot: one continuous line of thought. */
const knot: Gen = (n) => {
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const t = (i / n) * TAU;
    const p = 2;
    const q = 3;
    const rr = Math.cos(q * t) + 2.2;
    const tube = 0.18;
    out.set(
      [
        rr * Math.cos(p * t) * 0.82 + r(-tube, tube),
        rr * Math.sin(p * t) * 0.82 + r(-tube, tube),
        -Math.sin(q * t) * 0.9 + r(-tube, tube),
      ],
      i * 3,
    );
  }
  return out;
};

/** Experience — a double helix, a timeline with rungs. */
const helix: Gen = (n) => {
  const out = new Float32Array(n * 3);
  const H = 5.6;
  const turns = 2.4;
  for (let i = 0; i < n; i++) {
    const kind = Math.random();
    const t = Math.random();
    const y = (t - 0.5) * H;
    const a = t * turns * TAU;
    const R = 1.15;
    let x: number, z: number;
    if (kind < 0.4) {
      x = Math.cos(a) * R;
      z = Math.sin(a) * R;
    } else if (kind < 0.8) {
      x = Math.cos(a + Math.PI) * R;
      z = Math.sin(a + Math.PI) * R;
    } else {
      // rungs at discrete steps
      const step = Math.round(t * 22) / 22;
      const sa = step * turns * TAU;
      const k = r(-1, 1);
      x = Math.cos(sa) * R * k;
      z = Math.sin(sa) * R * k;
      out.set([x, (step - 0.5) * H, z], i * 3);
      continue;
    }
    out.set([x + r(-0.05, 0.05), y, z + r(-0.05, 0.05)], i * 3);
  }
  return out;
};

/** Projects — nested wireframe cubes: things built inside things. */
const cubes: Gen = (n) => {
  const out = new Float32Array(n * 3);
  const sizes = [2.5, 1.65, 0.85];
  const edges: [number[], number[]][] = [];
  const corners = [-1, 1];
  for (const a of corners)
    for (const b of corners) {
      edges.push([[-1, a, b], [1, a, b]]);
      edges.push([[a, -1, b], [a, 1, b]]);
      edges.push([[a, b, -1], [a, b, 1]]);
    }
  for (let i = 0; i < n; i++) {
    const s = sizes[i % 3] / 2;
    if (Math.random() < 0.82) {
      const [p0, p1] = edges[Math.floor(Math.random() * edges.length)];
      const t = Math.random();
      out.set(
        [
          (p0[0] + (p1[0] - p0[0]) * t) * s,
          (p0[1] + (p1[1] - p0[1]) * t) * s,
          (p0[2] + (p1[2] - p0[2]) * t) * s,
        ],
        i * 3,
      );
    } else {
      const S = sizes[0] / 2;
      const face = Math.floor(Math.random() * 6);
      const u = r(-S, S);
      const v = r(-S, S);
      const w = face % 2 ? S : -S;
      const pt = face < 2 ? [w, u, v] : face < 4 ? [u, w, v] : [u, v, w];
      out.set(pt, i * 3);
    }
  }
  const c = Math.cos(0.6);
  const sn = Math.sin(0.6);
  for (let i = 0; i < out.length; i += 3) {
    const x = out[i];
    const z = out[i + 2];
    out[i] = x * c - z * sn;
    out[i + 2] = x * sn + z * c;
  }
  return rotateX(out, 0.5);
};

/** Skills — an icosahedral constellation: every node connected. */
const constellation: Gen = (n) => {
  const out = new Float32Array(n * 3);
  const t = (1 + Math.sqrt(5)) / 2;
  const raw = [
    [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
    [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
    [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1],
  ];
  const R = 2.3;
  const verts = raw.map((v) => {
    const l = Math.hypot(v[0], v[1], v[2]);
    return v.map((c) => (c / l) * R);
  });
  const edges: [number, number][] = [];
  for (let a = 0; a < 12; a++)
    for (let b = a + 1; b < 12; b++) {
      const d = Math.hypot(
        verts[a][0] - verts[b][0],
        verts[a][1] - verts[b][1],
        verts[a][2] - verts[b][2],
      );
      if (d < R * 1.1) edges.push([a, b]);
    }
  for (let i = 0; i < n; i++) {
    const k = Math.random();
    if (k < 0.62) {
      const [a, b] = edges[Math.floor(Math.random() * edges.length)];
      const tt = Math.random();
      out.set(
        [0, 1, 2].map((j) => verts[a][j] + (verts[b][j] - verts[a][j]) * tt),
        i * 3,
      );
    } else if (k < 0.85) {
      const v = verts[Math.floor(Math.random() * 12)];
      const s = 0.16;
      out.set([v[0] + r(-s, s), v[1] + r(-s, s), v[2] + r(-s, s)], i * 3);
    } else {
      const th = r(0, TAU);
      const ph = Math.acos(r(-1, 1));
      const rr = r(0.2, 0.9);
      out.set(
        [rr * Math.sin(ph) * Math.cos(th), rr * Math.sin(ph) * Math.sin(th), rr * Math.cos(ph)],
        i * 3,
      );
    }
  }
  return out;
};

/** Education — stacked rings rising and narrowing: levels of learning. */
const tiers: Gen = (n) => {
  const out = new Float32Array(n * 3);
  const levels = 6;
  for (let i = 0; i < n; i++) {
    const L = Math.floor(Math.random() * levels);
    const f = L / (levels - 1);
    const R = 2.6 - f * 1.9 + r(-0.04, 0.04);
    const a = r(0, TAU);
    out.set([Math.cos(a) * R, -2 + f * 4 + r(-0.04, 0.04), Math.sin(a) * R], i * 3);
  }
  return rotateX(out, 0.28);
};

/** Contact — an open wave field reaching toward the visitor. */
const wave: Gen = (n) => {
  const out = new Float32Array(n * 3);
  const side = Math.ceil(Math.sqrt(n * 1.6));
  for (let i = 0; i < n; i++) {
    const gx = (i % side) / side;
    const gz = Math.floor(i / side) / (n / side);
    const x = (gx - 0.5) * 9;
    const z = (gz - 0.5) * 5.5;
    const y = Math.sin(x * 1.1) * 0.35 + Math.cos(z * 1.4) * 0.3 - 0.6;
    out.set([x, y, z], i * 3);
  }
  return rotateX(out, 0.55);
};

export const SHAPES: Gen[] = [planet, knot, helix, cubes, constellation, tiers, wave];

/** Per-section tint (rgb 0–1), mixed into the particle palette. */
export const TINTS: [number, number, number][] = [
  [0.66, 0.33, 0.97], // home – violet
  [0.38, 0.65, 0.98], // about – blue
  [0.13, 0.83, 0.93], // experience – cyan
  [0.94, 0.47, 0.85], // projects – magenta
  [0.66, 0.33, 0.97], // skills – violet
  [0.98, 0.75, 0.38], // education – amber
  [0.55, 0.45, 1.0], // contact – indigo
];

/** Where the formation sits horizontally (world units) per section, desktop only. */
export const OFFSETS_X = [2.4, -2.6, 2.7, 0, 0, -2.6, 0];

export function scatter(n: number): Float32Array {
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const th = r(0, TAU);
    const ph = Math.acos(r(-1, 1));
    const R = r(4.5, 12);
    out.set(
      [R * Math.sin(ph) * Math.cos(th), R * Math.sin(ph) * Math.sin(th) * 0.75, R * Math.cos(ph) * 0.8],
      i * 3,
    );
  }
  return out;
}
