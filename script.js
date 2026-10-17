const CANVAS_W = 1152;
const CANVAS_H = 768;
const YEAR_MIN = 1962;
const YEAR_MAX = 2022;
const U = 160;
const MAX_KEEP = 60;
const SHELL = "#8a5a2b";
const STRUCT = "#2f7d4f";
const INK = "#2b2b2b";

const BODY_BOX = {"01":[81,161,1103,561],"02":[46,141,1122,699],"03":[116,33,961,741],"04":[128,221,1022,738],"05":[66,195,1145,660],"06":[244,23,927,723],"07":[218,27,1048,730],"08":[194,168,917,740],"09":[202,125,948,722],"10":[196,58,987,743],"11":[338,66,829,715],"12":[299,27,838,759],"13":[142,61,1020,741],"14":[134,128,976,741],"15":[203,52,950,735],"16":[197,16,917,737],"17":[190,81,936,735],"18":[284,109,882,731],"19":[257,8,977,740],"20":[254,90,949,722],"21":[136,52,1058,667],"22":[233,10,1028,749],"23":[255,103,914,737],"24":[257,12,1037,727],"25":[315,5,819,749],"26":[141,120,969,709],"27":[211,10,1006,711],"28":[112,28,959,709],"29":[306,9,843,754],"30":[308,118,848,759],"31":[210,34,990,721],"32":[381,8,771,738],"33":[314,105,820,750],"34":[345,8,815,754],"35":[316,13,850,740],"36":[268,19,828,747],"37":[331,25,815,734],"38":[382,23,770,742],"39":[392,26,760,742]};
const PARTS_BOX = {"01":[100,162,1103,561],"02":[19,102,1079,602],"03":[116,20,938,698],"04":[153,22,1028,721],"05":[103,125,1145,660],"06":[254,23,931,719],"07":[247,26,1057,738],"08":[194,40,896,698],"09":[246,36,948,682],"10":[219,52,987,750],"11":[325,57,845,684],"12":[288,20,844,724],"13":[142,53,1020,751],"14":[105,23,917,711],"15":[203,15,906,709],"16":[198,4,865,693],"17":[190,2,912,714],"18":[246,4,849,684],"19":[295,10,974,737],"20":[202,9,890,705],"21":[182,39,1058,699],"22":[286,11,1026,724],"23":[211,9,862,679],"24":[310,6,1044,707],"25":[362,84,726,666],"26":[112,17,936,684],"27":[211,10,1006,706],"28":[104,21,905,696],"29":[346,52,753,716],"30":[307,13,787,757],"31":[241,93,960,680],"32":[382,9,770,738],"33":[314,18,806,750],"34":[382,91,741,671],"35":[314,9,780,739],"36":[299,84,738,685],"37":[480,113,771,668],"38":[416,143,735,669],"39":[431,90,721,686]};

let stage, input, labelEl, rulerEl, panelEl, focusEl, loadingEl;

let LANG = (() => { try { return localStorage.getItem("mouse-lang") === "ko" ? "ko" : "en"; } catch (e) { return "en"; } })();
const KO_WORD = {
  Wired: "유선", Wireless: "무선",
  Touch: "터치", Trackball: "트랙볼", Ball: "볼", Optical: "광학", Laser: "레이저",
  Box: "상자", Dome: "돔", Drop: "물방울", Ergonomic: "인체공학", "Multi-button": "다버튼", Flat: "납작형"
};
const tw = (w) => (LANG === "ko" ? KO_WORD[w] || w : w);
const ko = (en, k) => (LANG === "ko" ? k : en);
const originOf = (ch) => (LANG === "ko" ? LETTERS_KO[ch][0] : LETTERS[ch].origin);
const graftOf = (ch) => (LANG === "ko" ? LETTERS_KO[ch][1] : LETTERS[ch].graft);

function applyLang() {
  document.documentElement.lang = LANG;
  document.querySelectorAll("[data-ko]").forEach((el) => {
    if (el.dataset.en === undefined) el.dataset.en = el.textContent;
    el.textContent = LANG === "ko" ? el.dataset.ko : el.dataset.en;
  });
  const field = document.getElementById("mouse-input");
  if (field) field.placeholder = ko("TYPE A–Z", "A–Z 입력");
  const btn = document.getElementById("lang-toggle");
  if (btn) {
    btn.textContent = LANG === "ko" ? "EN" : "KR";
    btn.setAttribute("aria-label", LANG === "ko" ? "English" : "한국어");
  }
}
function setLang(next) {
  LANG = next;
  try { localStorage.setItem("mouse-lang", LANG); } catch (e) {}
  applyLang();
  render();
}
let tokens = [];
let insts = [];
let doms = new Map();
let focusIdx = -1;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const lerp = (a, b, t) => a + (b - a) * t;

function letterLineage(ch) {
  const ids = [...new Set(LETTERS[ch].parts.map((p) => p.m))];
  const year = ids.reduce((s, id) => s + MICE[id].year, 0) / ids.length;
  const lane = ids.reduce((s, id) => s + MICE[id].lane, 0) / ids.length;
  const wired = MOUSE_HAS_CABLE[ids[0]][0];
  return { ids, year, lane, wired };
}
const LINEAGE = {};
Object.keys(LETTERS).forEach((ch) => (LINEAGE[ch] = letterLineage(ch)));

function distanceBetween(prev, cur) {
  if (!prev || prev === cur) return 0;
  const a = LINEAGE[prev], b = LINEAGE[cur];
  return Math.hypot((b.year - a.year) * 7, (b.lane - a.lane) * 42);
}

function partGeometry(p) {
  const [x0, y0, x1, y1] = MOUSE_GEOMETRY[p.m];
  const bw = x1 - x0, bh = y1 - y0;
  const k = REAL_SIZE[p.m] * REAL_K * (p.s || 1);
  return { k, ax: (x0 + x1) / 2, ay: (y0 + y1) / 2, bw, bh };
}

function extentOf(q) {
  const p = q.p;
  const g = partGeometry(p);
  const box = (p.layer === "cable" ? PARTS_BOX : BODY_BOX)[p.m];
  const l = (box[0] - g.ax) * g.k, r = (box[2] - g.ax) * g.k, t = (box[1] - g.ay) * g.k, b = (box[3] - g.ay) * g.k;
  return { l, r, t, b };
}

const ASM_CACHE = {};
function assemblyOf(ch) {
  if (ASM_CACHE[ch]) return ASM_CACHE[ch];
  const ids = [...new Set(LETTERS[ch].parts.map((p) => p.m))];
  const S = ids[0];
  const T = ids[1] || ids[0];
  const V = ids[2];
  const h = ch.charCodeAt(0);
  const r1 = (((h * 37) % 11) - 5) / 5;
  const r2 = (((h * 53) % 13) - 6) / 6;
  const shell = { m: S, s: 1, dx: 0, dy: 0, layer: "body", role: "shell" };
  const gS = partGeometry(shell);
  const shellW = gS.bw * gS.k, shellH = gS.bh * gS.k;

  const fit = (id, f) => {
    const [x0, y0, x1, y1] = MOUSE_GEOMETRY[id];
    const bw = x1 - x0, bh = y1 - y0;
    const k = Math.min((shellW * f) / bw, (shellH * f) / bh);
    return Math.min(1, k / (REAL_SIZE[id] * REAL_K));
  };
  const f1 = 0.82 + 0.16 * (((h * 7) % 5) / 4);
  const parts = [shell, { m: T, s: fit(T, f1), dx: (r1 * 0.08 * shellW) / U, dy: (r2 * 0.08 * shellH) / U, layer: "cable", role: "structure" }];
  if (V) {
    const side = h % 2 ? 1 : -1;
    parts.push({ m: V, s: fit(V, 0.5), dx: (side * 0.26 * shellW) / U, dy: ((r2 > 0 ? -1 : 1) * 0.22 * shellH) / U, layer: "cable", role: "structure" });
  }
  return (ASM_CACHE[ch] = parts);
}

function sensorOf(id) {
  const m = MICE[id];
  if (id === "32") return "Touch";
  if (m.lane === 2) return "Trackball";
  if (m.year <= 1999) return "Ball";
  if (m.year <= 2003) return "Optical";
  return "Laser";
}
function traitsOf(inst) {
  const host = inst.parts[0].p.m;
  return { cable: MOUSE_HAS_CABLE[host][0] ? "Wired" : "Wireless", sensor: sensorOf(host), shape: LANES[MICE[host].lane] };
}
function traitChange(cur, prev) {
  if (!prev) return `${tw(cur.cable)} · ${tw(cur.sensor)} · ${tw(cur.shape)}`;
  const bit = (a, b) => (a === b ? tw(a) : `${tw(a)}→${tw(b)}`);
  return `${bit(prev.cable, cur.cable)} · ${bit(prev.sensor, cur.sensor)} · ${bit(prev.shape, cur.shape)}`;
}

function metricsOf(inst) {
  const ids = [...new Set(inst.parts.map((q) => q.p.m))];
  const yrs = ids.map((id) => MICE[id].year);
  return {
    ids,
    shellYear: yrs[0],
    gap: Math.max(...yrs) - Math.min(...yrs),
    mice: ids.length,
    wired: MOUSE_HAS_CABLE[ids[0]][0],
    distance: Math.round(inst.distance)
  };
}

function membersOf(ch) {
  const ids = [...new Set(LETTERS[ch].parts.map((p) => p.m))];
  const out = [];
  let right = null;
  ids.forEach((id, k) => {
    const probe = { m: id, s: 1, dx: 0, dy: 0, layer: "body" };
    const e = extentOf({ p: probe });
    const half = (e.r - e.l) / 2;
    const dx = right === null ? 0 : right + half - (right === null ? 0 : (half * 2) * 0.42);
    right = dx + half;
    const dy = (k % 2 ? 1 : -1) * (k ? 0.14 : 0) * (e.b - e.t);
    ["body", "cable"].forEach((layer) => out.push({ p: { m: id, s: 1, dx: dx / U, dy: dy / U, layer, role: k === 0 ? "shell" : "structure" } }));
  });
  return out.map((q, pi) => ({ ...q, pi }));
}

function computeInstances() {
  const out = [];
  const seen = {};
  tokens.forEach((ch, idx) => {
    const L = LINEAGE[ch];
    const prev = out.length ? out[out.length - 1] : null;
    const rep = seen[ch] || 0;
    seen[ch] = rep + 1;
    out.push({
      ch, idx, n: out.length, rep,
      parts: assemblyOf(ch).map((p, pi) => ({ p: { ...p }, pi })),
      members: membersOf(ch),
      year: L.year, lane: L.lane, wired: L.wired,
      distance: distanceBetween(prev && prev.ch, ch),
      prevCh: prev ? prev.ch : null
    });
  });
  return out;
}

function boundsOf(list) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  list.forEach((q) => {
    const e = extentOf(q);
    minX = Math.min(minX, q.p.dx * U + e.l); maxX = Math.max(maxX, q.p.dx * U + e.r);
    minY = Math.min(minY, q.p.dy * U + e.t); maxY = Math.max(maxY, q.p.dy * U + e.b);
  });
  return { minX, maxX, minY, maxY };
}

const geo = {};
const JOIN = 0.24;

let GLOBAL_BODY = null;
const bodiesOf = (list) => list.filter((q) => q.p.layer === "body");
function globalBody() {
  if (GLOBAL_BODY) return GLOBAL_BODY;
  let w = 0, h = 0;
  Object.keys(LETTERS).forEach((ch) => {
    [membersOf(ch), assemblyOf(ch).map((p) => ({ p }))].forEach((list) => {
      const b = boundsOf(list);
      w = Math.max(w, b.maxX - b.minX); h = Math.max(h, b.maxY - b.minY);
    });
  });
  return (GLOBAL_BODY = { w, h });
}
function layoutField(W, H) {
  const rulerY = 0;
  const fit = window.FIELD_FIT;
  const fieldTop = fit ? fit.top : (W < 600 ? 140 : 96);
  const fieldBottom = fit ? H - fit.bottom : H - (W < 600 ? 112 : 56);
  const fh = fieldBottom - fieldTop;
  Object.assign(geo, { W, H, rulerY, fieldTop, fieldBottom, fh });
  const G = globalBody();

  const fitAll = Math.min((fh * 0.98) / G.h, (W - 48) / G.w);
  const s = Math.max(fitAll, fh / 146);

  let prevU = null, maxH = 0;
  insts.forEach((inst) => {
    const bO = boundsOf(inst.members), bX = boundsOf(inst.parts);
    inst.offO = { x: -(bO.minX + bO.maxX) / 2, y: -(bO.minY + bO.maxY) / 2, r: 1 };
    inst.offX = { x: -(bX.minX + bX.maxX) / 2, y: -(bX.minY + bX.maxY) / 2, r: 1 };
    inst.wU = Math.max(bO.maxX - bO.minX, bX.maxX - bX.minX);
    inst.hU = Math.max(bO.maxY - bO.minY, bX.maxY - bX.minY);
    inst.xU = prevU ? prevU.xU + (prevU.wU + inst.wU) / 2 * (1 - JOIN) : inst.wU / 2;
    maxH = Math.max(maxH, inst.hU);
    prevU = inst;
  });
  insts.forEach((inst) => {
    inst.os = s;
    inst.w = inst.wU * s; inst.h = inst.hU * s;
    inst.wx = 24 + inst.xU * s;
    inst.cy = fieldTop + fh / 2 + ((inst.lane - 3) / 3) * Math.max(0, (fh - inst.h) / 2) * 0.3;
  });
  const last = insts[insts.length - 1];
  geo.maxShift = last ? Math.max(0, last.wx + last.w / 2 + 24 - W) : 0;
  const f = insts[focusIdx];
  geo.shift = f ? Math.max(0, Math.min(geo.maxShift, f.wx - W / 2)) : 0;
  insts.forEach((inst) => { inst.cx = inst.wx - geo.shift; });
}

const imageCache = {};
function src(id, layer) {
  return `./images/${id}_c_${layer === "cable" ? "parts" : "body"}.webp`;
}

function preloadImages() {
  const jobs = [];
  Object.keys(MICE).forEach((id) => ["body", "cable"].forEach((layer) => jobs.push([id, layer])));
  let done = 0;
  const total = jobs.length;
  const work = () => new Promise((resolve) => {
    const next = () => {
      const j = jobs.shift();
      if (!j) { resolve(); return; }
      const key = `${j[0]}_${j[1]}`;
      if (imageCache[key]) { done++; next(); return; }
      const img = new Image();
      img.decoding = "async";
      img.onload = img.onerror = () => { done++; loadingEl.textContent = done < total ? `${ko("LOADING IMAGES", "이미지 불러오는 중")} ${done} / ${total}` : ""; next(); };
      img.src = src(j[0], j[1]);
      imageCache[key] = img;
    };
    next();
  });
  Promise.all([work(), work(), work(), work(), work(), work()]).then(() => { loadingEl.textContent = ""; });
}

const keyOf = (i) => `${i.idx}_${i.ch}`;

function buildPart(p, layer) {
  const g = partGeometry(p);
  const wrap = document.createElement("div");
  wrap.className = `part ${layer}-part`;
  wrap.style.transform = `translate(${p.dx * U}px, ${p.dy * U}px)`;
  const img = document.createElement("img");
  img.alt = "";
  img.draggable = false;
  img.src = src(p.m, layer);
  img.style.width = `${CANVAS_W * g.k}px`;
  img.style.left = `${-g.ax * g.k}px`;
  img.style.top = `${-g.ay * g.k}px`;
  wrap.appendChild(img);
  return wrap;
}

function buildGroup(cls, list, off) {
  const g = document.createElement("div");
  g.className = cls;
  g.style.transform = `scale(${off.r}) translate(${off.x}px, ${off.y}px)`;
  list.forEach((q, qi) => {
    const w = buildPart(q.p, q.p.layer);
    w.style.zIndex = String(q.p.layer === "cable" ? 100 + qi : qi);
    g.appendChild(w);
  });
  return g;
}

function buildObject(inst) {
  const el = document.createElement("div");
  el.className = "obj";
  el.appendChild(buildGroup("og", inst.members, inst.offO));
  el.appendChild(buildGroup("xg", inst.parts.map((q) => ({ p: { ...q.p, layer: q.p.layer } })), inst.offX));
  return { el };
}

function render() {
  const W = window.innerWidth, H = window.innerHeight;
  insts = computeInstances();
  layoutField(W, H);
  const want = new Set(insts.map(keyOf));
  doms.forEach((d, k) => { if (!want.has(k)) { d.el.remove(); doms.delete(k); } });
  insts.forEach((inst) => {
    const k = keyOf(inst);
    let d = doms.get(k);
    const visible = inst.cx + inst.w / 2 > -20 && inst.cx - inst.w / 2 < W + 20;
    if (!d && visible) { d = buildObject(inst); panelEl.appendChild(d.el); doms.set(k, d); }
    if (!d) return;
    d.el.style.display = visible ? "" : "none";
    d.el.style.transform = `translate(${inst.cx}px, ${inst.cy}px) scale(${inst.os})`;
    d.el.style.zIndex = String(10 + inst.n);
  });
  drawRuler();
  drawFocus();
  updateLabel();
  refreshPanels();
}

function drawRuler() { rulerEl.innerHTML = ""; }

function drawFocus() { focusEl.style.display = "none"; }

function setFocus(i) {
  if (!insts.length) { focusIdx = -1; render(); return; }
  focusIdx = Math.max(0, Math.min(insts.length - 1, i));
  render();
}

function mouseText(role, id) {
  const m = MICE[id];
  return `<b class="${role === "shell" ? "sh" : "st"}">${role === "shell" ? ko("BODY", "몸체") : ko("MACHINE", "기계")} ${id} ${esc(m.name)} ${m.year}</b>`;
}
function updateLabel() {
  const inst = insts[focusIdx];
  if (!inst) {
    labelEl.innerHTML = `<div class="l1"><span class="hint">${ko("Type A–Z. Each letter is the body of one mouse with the machine of another inside it.", "A–Z를 입력하세요. 글자마다 한 마우스의 몸체 안에 다른 마우스의 기계가 들어 있습니다.")}</span></div>`;
    return;
  }
  const m = metricsOf(inst);
  const years = m.ids.map((id) => MICE[id].year);
  const range = Math.min(...years) === Math.max(...years) ? `${years[0]}` : `${Math.min(...years)}–${Math.max(...years)}`;
  const mix = inst.parts.map((q) => mouseText(q.p.role, q.p.m)).join(" + ");
  const prev = insts[inst.n - 1];
  const change = traitChange(traitsOf(inst), prev ? traitsOf(prev) : null);
  labelEl.innerHTML =
    `<div class="l1"><span class="chip">${inst.ch}</span><span>${esc(originOf(inst.ch))}</span><span class="yr">${range}</span></div>` +
    `<div class="l2">${esc(graftOf(inst.ch))}</div>` +
    `<div class="l3">${mix}</div>` +
    `<div class="l4">${esc(change)}${prev ? ` · ${ko(`distance from ${prev.ch}`, `${prev.ch}부터의 거리`)}: ${m.distance}` : ""}</div>`;
}

function normalize(value) { return value.toUpperCase().replace(/[^A-Z]/g, ""); }

function handleInput() {
  const next = normalize(input.value).slice(0, 60);
  if (input.value !== next) input.value = next;
  const prev = tokens.join("");
  if (next === prev) return;
  const grew = next.length > prev.length && next.startsWith(prev);
  tokens = [...next];
  if (tokens.length) focusIdx = tokens.length - 1; else focusIdx = -1;
  render();
  if (grew) Sound.type(insts[insts.length - 1]); else Sound.remove();
}

function toggleXray(force) {
  const on = typeof force === "boolean" ? force : !document.body.classList.contains("xray");
  document.body.classList.toggle("xray", on);
  const b = document.getElementById("xray-toggle");
  b.setAttribute("aria-pressed", String(on));
  Sound.setXray(on);
}

function init() {
  stage = document.getElementById("render-stage");
  input = document.getElementById("mouse-input");
  labelEl = document.getElementById("label");
  rulerEl = document.getElementById("ruler");
  panelEl = document.getElementById("panel");
  focusEl = document.getElementById("focus-frame");
  loadingEl = document.getElementById("loading");
  preloadImages();

  ["keydown", "pointerdown", "touchstart", "touchend", "pointerup", "click"].forEach((ev) => window.addEventListener(ev, () => Sound.start(), { passive: true }));

  input.addEventListener("input", handleInput);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") e.preventDefault();
    if (e.key === "Tab") { e.preventDefault(); toggleXray(); }
    if (e.key === "ArrowLeft") { e.preventDefault(); setFocus(focusIdx - 1); Sound.browse(); }
    if (e.key === "ArrowRight") { e.preventDefault(); setFocus(focusIdx + 1); Sound.browse(); }
    if (e.key === "Escape") closePanels();
    if (e.key.length === 1 && input.selectionStart !== input.value.length) input.setSelectionRange(input.value.length, input.value.length);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closePanels();
    if (document.activeElement !== input && /^[a-zA-Z]$/.test(e.key) && !e.metaKey && !e.ctrlKey) input.focus();
  });
  stage.addEventListener("pointerdown", () => input.focus());
  rulerEl.addEventListener("click", (e) => {
    const d = e.target.closest(".dot");
    if (d) { setFocus(Number(d.dataset.i)); Sound.browse(); input.focus(); }
  });
  let wheelAt = 0;
  stage.addEventListener("wheel", (e) => {
    const now = performance.now();
    if (now - wheelAt < 160 || !insts.length) return;
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(d) < 4) return;
    wheelAt = now;
    setFocus(focusIdx + (d > 0 ? 1 : -1)); Sound.browse();
  }, { passive: true });
  let downX = null;
  stage.addEventListener("pointerdown", (e) => { downX = e.clientX; });
  stage.addEventListener("pointerup", (e) => {
    if (downX === null) return;
    const dx = e.clientX - downX; downX = null;
    if (Math.abs(dx) > 60 && insts.length) { setFocus(focusIdx + (dx < 0 ? 1 : -1)); Sound.browse(); }
  });
  document.getElementById("xray-toggle").addEventListener("click", () => { toggleXray(); input.focus(); });

  initPanels();
  applyLang();
  document.getElementById("lang-toggle").addEventListener("click", () => { setLang(LANG === "ko" ? "en" : "ko"); input.focus(); });

  let resizeTimer = null;
  window.addEventListener("resize", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(render, 120); });
  render();
}

function svgEl(w, h, inner) {
  return `<svg role="img" width="100%" viewBox="0 0 ${w} ${h}">${inner}</svg>`;
}

function buildReceiptText() {
  const out = [ko("MOUSE GRAFT RECEIPT", "마우스 접목 영수증"), new Date().toLocaleString(ko("en-GB", "ko-KR")), "--------------------------------------"];
  insts.forEach((r, i) => {
    const m = metricsOf(r);
    out.push(`${String(i + 1).padStart(2, "0")}  ${r.ch}   ${originOf(r.ch)}`);
    out.push(`    ${graftOf(r.ch)}`);
    r.parts.forEach((q) => {
      const mm = MICE[q.p.m];
      out.push(`    ${q.p.role === "shell" ? ko("BODY    ", "몸체 ") : ko("MACHINE ", "기계 ")} ${q.p.m} ${mm.name} (${mm.approx ? "c." : ""}${mm.year})`);
    });
    out.push(ko(`    YEAR ${Math.round(r.year)}  SPAN ${m.gap} yr  MICE ${m.mice}  DIST ${m.distance}`, `    연도 ${Math.round(r.year)}  폭 ${m.gap}년  마우스 ${m.mice}  거리 ${m.distance}`));
    out.push(`    ${traitChange(traitsOf(r), i ? traitsOf(insts[i - 1]) : null)}`);
    out.push("");
  });
  if (!insts.length) out.push(ko("Type A–Z. Every letter is recorded here.", "A–Z를 입력하세요. 모든 글자가 여기에 기록됩니다."));
  else {
    out.push("--------------------------------------");
    const total = insts.reduce((n, r) => n + metricsOf(r).mice, 0);
    out.push(ko(`TOTAL  ${insts.length} letters  ${total} mice`, `합계  ${insts.length}글자  마우스 ${total}개`));
  }
  return out.join("\n");
}

function buildLineageSVG() {
  const W = 760, H = 430, x0 = 96, x1 = 738, y0 = 40, y1 = 372;
  const X = (y) => x0 + ((y - YEAR_MIN) / (YEAR_MAX - YEAR_MIN)) * (x1 - x0);
  const Y = (lane) => y0 + (lane / (LANES.length - 1)) * (y1 - y0);
  let g = "";
  LANES.forEach((name, i) => {
    g += `<line x1="${x0}" x2="${x1}" y1="${Y(i)}" y2="${Y(i)}" stroke="#eee"/><text x="${x0 - 8}" y="${Y(i) + 3}" text-anchor="end" class="ax">${tw(name)}</text>`;
  });
  [1970, 1980, 1990, 2000, 2010, 2020].forEach((yr) => {
    g += `<line x1="${X(yr)}" x2="${X(yr)}" y1="${y0 - 10}" y2="${y1 + 10}" stroke="#f1f1f1"/><text x="${X(yr)}" y="${y1 + 28}" text-anchor="middle" class="ax">${yr}</text>`;
  });
  const typed = [...new Set(insts.map((n) => n.ch))];
  const onIds = new Set();
  typed.forEach((ch) => LINEAGE[ch].ids.forEach((id) => onIds.add(id)));
  const slot = {}, pos = {};
  Object.entries(MICE).forEach(([id, m]) => {
    const k = `${m.year}_${m.lane}`;
    slot[k] = (slot[k] || 0) + 1;
    pos[id] = { x: X(m.year), y: Y(m.lane) + (slot[k] - 1) * 10 - 5 };
  });

  if (insts.length > 1) {
    g += `<polyline fill="none" stroke="#9a9a9a" stroke-width="1.1" stroke-dasharray="4 3" points="${insts.map((n) => `${X(LINEAGE[n.ch].year)},${Y(LINEAGE[n.ch].lane)}`).join(" ")}"/>`;
  }

  typed.forEach((ch) => {
    const L = LINEAGE[ch];
    L.ids.forEach((id, k) => {
      g += `<line x1="${X(L.year)}" y1="${Y(L.lane)}" x2="${pos[id].x}" y2="${pos[id].y}" stroke="${k === 0 ? SHELL : STRUCT}" stroke-width="1.2"/>`;
    });
  });
  Object.keys(MICE).forEach((id) => {
    const on = onIds.has(id);
    g += `<circle cx="${pos[id].x}" cy="${pos[id].y}" r="${on ? 3.4 : 2.3}" fill="${on ? INK : "#fff"}" stroke="#888"><title>${id} ${esc(MICE[id].name)} ${MICE[id].year}</title></circle>`;
    g += `<text x="${pos[id].x + 5}" y="${pos[id].y - 3}" class="ax" style="font-size:7px">${id}</text>`;
  });
  Object.keys(LETTERS).forEach((ch) => {
    const L = LINEAGE[ch];
    const on = typed.includes(ch);
    g += `<circle cx="${X(L.year)}" cy="${Y(L.lane)}" r="9" fill="${on ? INK : "#fff"}" stroke="${on ? SHELL : "#bbb"}" stroke-width="${on ? 1.6 : 1}"><title>${ch} ${esc(originOf(ch))}</title></circle>`;
    g += `<text x="${X(L.year)}" y="${Y(L.lane) + 3}" text-anchor="middle" class="nd" style="fill:${on ? "#fff" : "#999"}">${ch}</text>`;
  });
  return svgEl(W, H, g);
}

function barChart(title, unit, keys, parts, colors) {
  const W = 760, H = 150, l = 44, r = 16, t = 26, b = 24;
  const n = Math.max(keys.length, 1);
  const totals = parts.map((a) => a.reduce((x, y) => x + y, 0));
  const max = Math.max(...totals, 1);
  const slot = (W - l - r) / n;
  const bw = Math.min(26, slot - 4);
  let g = `<text x="${l}" y="14" class="ct">${title}</text>`;
  [0, 0.5, 1].forEach((k) => {
    const y = t + (H - t - b) * (1 - k);
    g += `<line x1="${l}" x2="${W - r}" y1="${y}" y2="${y}" stroke="#eee"/><text x="${l - 6}" y="${y + 3}" text-anchor="end" class="ax">${Math.round(max * k)}</text>`;
  });
  keys.forEach((key, i) => {
    const x = l + slot * i + (slot - bw) / 2;
    let acc = 0;
    parts[i].forEach((pv, k) => {
      const h = (pv / max) * (H - t - b);
      const y = H - b - (acc / max) * (H - t - b) - h;
      if (h > 0) g += `<rect x="${x}" y="${y}" width="${bw}" height="${Math.max(h - 1.5, 0.5)}" fill="${colors[k % colors.length]}"><title>${esc(key)}: ${pv}${unit}</title></rect>`;
      acc += pv;
    });
    g += `<text x="${x + bw / 2}" y="${H - 8}" text-anchor="middle" class="ax">${esc(key)}</text>`;
    if (i === keys.length - 1) g += `<text x="${x + bw / 2}" y="${Math.max(t - 4, H - b - (totals[i] / max) * (H - t - b) - 5)}" text-anchor="middle" class="ax">${totals[i]}${unit}</text>`;
  });
  return svgEl(W, H, g);
}

function networkChart() {
  const W = 760, H = 190, l = 30, r = 30, base = 140;
  const X = (y) => l + ((y - YEAR_MIN) / (YEAR_MAX - YEAR_MIN)) * (W - l - r);
  let g = `<text x="${l}" y="14" class="ct">${ko("Graft network: an arc joins the body mouse to the mouse whose machine sits inside it", "접목 네트워크: 몸체 마우스와 그 안에 기계가 들어간 마우스를 호로 잇습니다")}</text>`;
  g += `<line x1="${l}" x2="${W - r}" y1="${base}" y2="${base}" stroke="#999"/>`;
  const edge = new Map(), used = new Set();
  insts.forEach((it) => {
    const ids = metricsOf(it).ids;
    ids.forEach((id) => used.add(id));
    ids.slice(1).forEach((id) => { const k = `${ids[0]}>${id}`; edge.set(k, (edge.get(k) || 0) + 1); });
  });
  edge.forEach((n, k) => {
    const [a, c] = k.split(">");
    const x1 = X(MICE[a].year), x2 = X(MICE[c].year);
    const span = Math.abs(x2 - x1);
    if (span < 1) return;
    const ry = Math.min(span / 2, base - 30);
    g += `<path d="M${x1} ${base} A${span / 2} ${ry} 0 0 ${x2 > x1 ? 1 : 0} ${x2} ${base}" fill="none" stroke="${STRUCT}" stroke-width="${(1 + n * 0.8).toFixed(1)}"><title>${a} → ${c} × ${n}</title></path>`;
  });
  Object.entries(MICE).forEach(([id, m]) => {
    const x = X(m.year);
    g += `<circle cx="${x}" cy="${base}" r="3.4" fill="${used.has(id) ? INK : "#fff"}" stroke="#777"><title>${esc(m.name)} ${m.year}</title></circle>`;
    g += `<text x="${x}" y="${base + 14 + (Number(id) % 2) * 9}" text-anchor="middle" class="ax" style="font-size:7px">${id}</text>`;
  });
  g += `<text x="${l}" y="${H - 6}" class="ax">${YEAR_MIN}</text><text x="${W - r}" y="${H - 6}" text-anchor="end" class="ax">${YEAR_MAX}</text>`;
  return svgEl(W, H, g);
}

function buildGraphHTML() {
  if (!insts.length) return `<p class="empty">${ko("Type letters to see how each one responds.", "글자를 입력하면 글자마다의 반응이 보입니다.")}</p>`;
  const rows = insts.slice(-24).map((it) => ({ it, m: metricsOf(it) }));
  const keys = rows.map((x) => x.it.ch);
  return `<div class="legend"><i style="background:${SHELL}"></i>${ko("body", "몸체")} <i style="background:${STRUCT}"></i>${ko("machine inside", "안에 든 기계")}</div>` +
    barChart(ko("Years spanned inside each letter (oldest to newest mouse)", "글자 안의 연도 폭 (가장 오래된 마우스부터 가장 새 마우스까지)"), ko(" yr", "년"), keys, rows.map((x) => [x.m.gap]), [STRUCT]) +
    barChart(ko("Distance from the previous letter on the lineage map", "계보도에서 앞 글자와의 거리"), "", keys, rows.map((x) => [x.m.distance]), [SHELL]) +
    barChart(ko("Mice grafted into each letter (body + machines)", "글자마다 접목된 마우스 수 (몸체 + 기계)"), "", keys, rows.map((x) => [1, x.m.mice - 1]), [SHELL, STRUCT]) +
    networkChart();
}

const panelBuilders = {
  "panel-receipt": () => { document.getElementById("receipt-text").textContent = buildReceiptText(); },
  "panel-lineage": () => { document.getElementById("lineage-body").innerHTML = buildLineageSVG() + `<p class="hint">${ko("Grey dashed line: typing order. Brown line: the body mouse. Green line: a mouse whose machine sits inside.", "회색 점선: 타이핑 순서. 갈색 선: 몸체 마우스. 초록 선: 기계가 들어간 마우스.")}</p>`; },
  "panel-graph": () => { document.getElementById("graph-body").innerHTML = buildGraphHTML(); }
};
function refreshPanels() {
  document.querySelectorAll(".panel.show").forEach((p) => panelBuilders[p.id] && panelBuilders[p.id]());
}
function closePanels() {
  const open = document.querySelector(".panel.show");
  document.querySelectorAll(".panel").forEach((p) => p.classList.remove("show"));
  document.querySelectorAll(".tool").forEach((b) => b.setAttribute("aria-pressed", "false"));
  return !!open;
}
function initPanels() {
  document.querySelectorAll(".tool").forEach((btn) =>
    btn.addEventListener("click", () => {
      const id = btn.dataset.panel;
      const wasOpen = document.getElementById(id).classList.contains("show");
      closePanels();
      if (!wasOpen) {
        document.getElementById(id).classList.add("show");
        btn.setAttribute("aria-pressed", "true");
        panelBuilders[id]();
        Sound.browse();
      }
      input.focus();
    })
  );
  document.querySelectorAll(".panel-close").forEach((b) => b.addEventListener("click", closePanels));
  document.getElementById("receipt-print").addEventListener("click", () => { panelBuilders["panel-receipt"](); window.print(); });
  document.getElementById("receipt-save").addEventListener("click", () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([buildReceiptText()], { type: "text/plain" }));
    a.download = `mouse-receipt-${Date.now()}.txt`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  });
}

const Sound = (() => {
  let ctx = null;
  let master, bed, bedFilter, sfx, scanGain;
  let started = false;
  let noiseBuf = null;
  let busy = 0;
  let nextRub = 0;
  let lastType = -10;

  const seeded = (i, k) => { const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return v - Math.floor(v); };

  function makeNoise(ac) {
    const len = ac.sampleRate * 2;
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      last = (last + 0.02 * w) / 1.02;
      d[i] = w * 0.6 + last * 3.0;
    }
    return buf;
  }
  function noiseSource(loop) {
    const s = ctx.createBufferSource();
    s.buffer = noiseBuf;
    s.loop = !!loop;
    return s;
  }
  function env(g, t, a, peak, d) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
  }
  function burst(t, { freq, q = 1, type = "bandpass", peak, a = 0.002, d = 0.05, bus = sfx }) {
    const s = noiseSource(false);
    const f = ctx.createBiquadFilter();
    f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = ctx.createGain();
    env(g, t, a, peak, d);
    s.connect(f).connect(g).connect(bus);
    s.start(t, Math.random() * 1.5);
    s.stop(t + a + d + 0.05);
    return { f, g };
  }
  function tone(t, { f0, f1 = f0, peak, a = 0.002, d = 0.1, type = "sine", bus = sfx }) {
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + a + d);
    const g = ctx.createGain();
    env(g, t, a, peak, d);
    o.connect(g).connect(bus);
    o.start(t);
    o.stop(t + a + d + 0.05);
  }

  function grain(t, dur, { freq, q = 1, type = "bandpass", peak, am = 70, depth = 0.6, a = 0.3, f1 = null, bus = sfx }) {
    const s = noiseSource(true);
    const f = ctx.createBiquadFilter();
    f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q;
    if (f1) f.frequency.linearRampToValueAtTime(f1, t + dur);
    const flutter = ctx.createGain();
    flutter.gain.value = 1 - depth / 2;
    const lfo = ctx.createOscillator();
    lfo.type = "square"; lfo.frequency.value = am;
    const lfoAmt = ctx.createGain();
    lfoAmt.gain.value = depth / 2;
    lfo.connect(lfoAmt).connect(flutter.gain);
    const g = ctx.createGain();
    env(g, t, Math.max(0.01, dur * a), peak, Math.max(0.02, dur * (1 - a)));
    s.connect(f).connect(flutter).connect(g).connect(bus);
    s.start(t, Math.random() * 1.2);
    lfo.start(t);
    s.stop(t + dur + 0.1);
    lfo.stop(t + dur + 0.1);
  }

  function tap(t, lvl = 1) {
    burst(t, { freq: 1700, q: 1.4, peak: 0.55 * lvl, d: 0.028 });
    tone(t, { f0: 430, f1: 210, peak: 0.32 * lvl, d: 0.055, type: "triangle" });
  }
  function glide(t, dur, up, lvl = 1, rough = 1) {
    const a = up ? 800 : 2600, b = up ? 2600 : 800;
    grain(t, dur, { freq: a, f1: b, q: 0.9, peak: 0.2 * lvl, am: 55 + rough * 25, depth: 0.45 * rough, a: 0.3 });
  }
  function press(t, age, lvl = 1) {
    const body = 270 - (1 - age) * 70;
    burst(t, { freq: 1100, q: 1.2, peak: 0.5 * lvl, d: 0.02 + (1 - age) * 0.012 });
    tone(t, { f0: body, f1: body * 0.55, peak: 0.42 * lvl, d: 0.05 + (1 - age) * 0.04 });
    tone(t, { f0: 3400, f1: 2300, peak: 0.05 * lvl, d: 0.008, type: "square" });
  }
  function geuk(t, lvl = 1) {
    tone(t, { f0: 150, f1: 80, peak: 0.36 * lvl, d: 0.05 });
    burst(t + 0.045, { freq: 2700, q: 4, peak: 0.46 * lvl, d: 0.012 });
    tone(t + 0.045, { f0: 4200, f1: 2800, peak: 0.07 * lvl, d: 0.01, type: "square" });
  }
  function doubleClick(t, lvl = 1) { geuk(t, lvl); geuk(t + 0.13, lvl * 0.92); }
  function wheel(t, n, free, lvl = 1) {
    if (free) {
      const dur = n * 0.036;
      grain(t, dur, { freq: 3000, q: 1.6, peak: 0.12 * lvl, am: 95, depth: 0.7, a: 0.15 });
      for (let i = 0; i < 4; i++) burst(t + i * dur / 4, { freq: 4200, q: 3, type: "bandpass", peak: 0.05 * lvl, d: 0.01 });
      return t + dur;
    }
    let c = t;
    for (let i = 0; i < n; i++) {
      burst(c, { freq: 3300, q: 1.2, type: "highpass", peak: 0.17 * lvl, d: 0.007 });
      tone(c, { f0: 1500, f1: 820, peak: 0.05 * lvl, d: 0.014, type: "triangle" });
      tone(c, { f0: 210, f1: 140, peak: 0.12 * lvl, d: 0.022 });
      c += 0.048 + 0.022 * (i / n) + Math.random() * 0.006;
    }
    return c;
  }
  function roll(t, dur, lvl = 1) {
    grain(t, dur, { freq: 260, q: 2.4, peak: 0.26 * lvl, am: 24, depth: 0.75, a: 0.2 });
    grain(t, dur, { freq: 3800, q: 0.7, type: "highpass", peak: 0.03 * lvl, am: 24, depth: 0.5, a: 0.2 });
  }
  function cableScrape(t, lvl = 1) {
    grain(t, 0.3, { freq: 650, f1: 1100, q: 0.9, peak: 0.07 * lvl, am: 40, depth: 0.5, a: 0.4 });
  }
  function palm(t, lvl = 1) {
    tone(t, { f0: 95, f1: 55, peak: 0.24 * lvl, d: 0.14 });
    burst(t, { freq: 420, q: 0.7, type: "lowpass", peak: 0.14 * lvl, d: 0.1 });
  }

  function phrase(inst, t0, short) {
    const ids = metricsOf(inst).ids;
    const age = Math.min(1, Math.max(0, (inst.year - YEAR_MIN) / (YEAR_MAX - YEAR_MIN)));
    const code = inst.ch.charCodeAt(0);
    const r = (k) => seeded(code, k);
    const wheelMouse = ids.some((id) => WHEEL.includes(id));
    const freeWheel = ids.some((id) => FREE_WHEEL.includes(id));
    const ballMouse = ids.some((id) => ["Ball", "Trackball"].includes(sensorOf(id)));
    const heavy = 1 - age * 0.45;
    let c = t0;
    if (short) {
      tap(c, 0.8);
      press(c + 0.06, age, 0.8); press(c + 0.15, age, 0.7);
      return;
    }

    const pat = Math.floor(r(1) * 3);
    tap(c, heavy);
    glide(c + 0.07, 0.15 + r(2) * 0.05, r(3) > 0.5, 1);
    c += 0.3;
    if (pat === 0) { tap(c, heavy * 0.9); glide(c + 0.05, 0.13, r(4) > 0.5, 0.9); glide(c + 0.24, 0.16, r(5) > 0.5, 1); c += 0.45; }
    else if (pat === 1) { glide(c, 0.14, r(4) > 0.5, 0.9); tap(c + 0.2, heavy * 0.8); c += 0.34; }
    else { tap(c, heavy * 0.9); glide(c + 0.05, 0.2, r(4) > 0.5, 1); c += 0.34; }

    const gapP = 0.075 + (1 - age) * 0.03;
    for (let i = 0; i < 3; i++) press(c + i * gapP, age, 0.9 - i * 0.08);
    c += 3 * gapP + 0.12;

    if (wheelMouse) {
      const groups = 1 + (r(6) > 0.5 ? 1 : 0);
      for (let i = 0; i < groups; i++) c = wheel(c, 6 + Math.floor(r(7 + i) * 6), freeWheel, 1) + 0.12;
    } else if (ballMouse) {
      roll(c, 0.38 + r(8) * 0.2, 1); c += 0.5;
    }

    if (ids.length >= 3 || MICE[ids[0]].lane >= 4) { doubleClick(c, 1); c += 0.3; }
    if (inst.wired) cableScrape(c - 0.1, 1);
  }

  function rubSwell(t) {
    const dur = 0.35 + Math.random() * 0.5;
    const up = Math.random() > 0.5;
    grain(t, dur, { freq: up ? 1000 : 2400, f1: up ? 2400 : 1000, q: 0.6, peak: 0.022 + Math.random() * 0.03, am: 45, depth: 0.5, a: 0.4, bus: bed });
    if (Math.random() < 0.4) burst(t + dur * 0.8, { freq: 1500, q: 1.2, peak: 0.02, d: 0.03, bus: bed });
  }
  function schedule() {
    if (!ctx) return;
    const ahead = ctx.currentTime + 0.4;
    while (nextRub < ahead) {
      rubSwell(nextRub);
      nextRub += (3.2 - busy * 2.0) * (0.7 + Math.random() * 0.6);
    }
  }
  function setup(ac, dest) {
    ctx = ac;
    noiseBuf = makeNoise(ac);
    master = ac.createGain();
    master.gain.value = 0.9;
    const comp = ac.createDynamicsCompressor();
    comp.threshold.value = -16; comp.ratio.value = 3;
    master.connect(comp).connect(dest);

    bedFilter = ac.createBiquadFilter();
    bedFilter.type = "lowpass"; bedFilter.frequency.value = 9000;
    bed = ac.createGain();
    bed.gain.value = 0.0001;
    bed.connect(bedFilter).connect(master);
    bed.gain.linearRampToValueAtTime(0.5, ac.currentTime + 2.5);

    sfx = ac.createGain();
    sfx.gain.value = 1.25;
    sfx.connect(master);

    const air = noiseSource(true);
    const airF = ac.createBiquadFilter(); airF.type = "lowpass"; airF.frequency.value = 800;
    const airG = ac.createGain(); airG.gain.value = 0.05;
    air.connect(airF).connect(airG).connect(bed); air.start();

    [50, 100].forEach((f, i) => {
      const o = ac.createOscillator(); o.frequency.value = f;
      const g = ac.createGain(); g.gain.value = [0.014, 0.006][i];
      const lfo = ac.createOscillator(); lfo.frequency.value = 0.13 + i * 0.07;
      const la = ac.createGain(); la.gain.value = g.gain.value * 0.4;
      lfo.connect(la).connect(g.gain);
      o.connect(g).connect(bed); o.start(); lfo.start();
    });

    const desk = noiseSource(true);
    const deskF = ac.createBiquadFilter(); deskF.type = "bandpass"; deskF.frequency.value = 85; deskF.Q.value = 5;
    const deskG = ac.createGain(); deskG.gain.value = 0.16;
    desk.connect(deskF).connect(deskG).connect(bed); desk.start();

    const skin = noiseSource(true);
    const skinF = ac.createBiquadFilter(); skinF.type = "bandpass"; skinF.frequency.value = 1700; skinF.Q.value = 0.5;
    const skinG = ac.createGain(); skinG.gain.value = 0.006;
    skin.connect(skinF).connect(skinG).connect(bed); skin.start();

    scanGain = ac.createGain(); scanGain.gain.value = 0;
    [1480, 1487].forEach((f) => { const o = ac.createOscillator(); o.frequency.value = f; o.connect(scanGain); o.start(); });
    const sh = ac.createOscillator(); sh.type = "sawtooth"; sh.frequency.value = 100;
    const shF = ac.createBiquadFilter(); shF.type = "lowpass"; shF.frequency.value = 400;
    const shG = ac.createGain(); shG.gain.value = 0.25;
    sh.connect(shF).connect(shG).connect(scanGain); sh.start();
    scanGain.connect(master);
  }

  return {
    start() {
      try { if (navigator.audioSession && navigator.audioSession.type !== "playback") navigator.audioSession.type = "playback"; } catch (e) {}
      if (started) { if (ctx && ctx.state !== "running" && ctx.state !== "closed") ctx.resume(); return; }
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      started = true;
      const ac = new AC();
      setup(ac, ac.destination);
      nextRub = ac.currentTime + 1.5;
      setInterval(schedule, 80);
    },
    type(inst) {
      if (!ctx) return;
      const now = ctx.currentTime;
      const short = now - lastType < 0.4;
      lastType = now;
      busy = Math.min(1, insts.length / 40);
      phrase(inst, now + 0.01, short);
    },
    remove() {
      if (!ctx) return;
      const t = ctx.currentTime + 0.01;
      glide(t, 0.14, false, 0.9); tap(t + 0.12, 0.7);
    },
    browse() {
      if (!ctx) return;
      press(ctx.currentTime + 0.005, 0.6, 0.5);
    },
    setXray(on) {
      if (!ctx) return;
      const t = ctx.currentTime;
      bedFilter.frequency.cancelScheduledValues(t);
      bedFilter.frequency.linearRampToValueAtTime(on ? 650 : 9000, t + 0.6);
      scanGain.gain.cancelScheduledValues(t);
      scanGain.gain.linearRampToValueAtTime(on ? 0.018 : 0, t + 0.6);
      glide(t, 0.3, on, 0.7);
    }
  };
})();

document.addEventListener("DOMContentLoaded", init);