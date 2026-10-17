(() => {
  "use strict";

  const TOUCH = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  const root = document.documentElement;
  root.classList.add(TOUCH ? "touch-ui" : "desk-ui");
  if (!TOUCH) return;

  const $ = (id) => document.getElementById(id);
  const dock = $("typed");
  const field = $("mouse-input");
  const tools = $("tools");
  const label = $("label");

  field.readOnly = true;
  field.setAttribute("inputmode", "none");
  field.removeAttribute("autofocus");
  field.tabIndex = -1;

  const ROWS = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Z", "X", "C", "V", "B", "N", "M", "back"],
    ["prev", "next", "hide"],
  ];
  const FN = {
    back: ["⌫", "Delete last letter"],
    prev: ["‹", "Previous letter"],
    next: ["›", "Next letter"],
    hide: ["HIDE KEYS", "Hide keyboard"],
  };

  const shown = document.createElement("div");
  shown.id = "typed-line";
  dock.insertBefore(shown, dock.firstChild);

  const kbd = document.createElement("div");
  kbd.id = "kbd";
  kbd.setAttribute("role", "group");
  kbd.setAttribute("aria-label", "Mouse keyboard");
  ROWS.forEach((row, ri) => {
    const r = document.createElement("div");
    r.className = "kbd-row" + (ri === 3 ? " kbd-nav" : "");
    row.forEach((k) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "key" + (FN[k] ? " key-fn key-" + k : "");
      b.dataset.key = k;
      b.textContent = FN[k] ? FN[k][0] : k;
      if (FN[k]) b.setAttribute("aria-label", FN[k][1]);
      if (k === "hide") b.dataset.ko = "자판 접기";
      r.appendChild(b);
    });
    kbd.appendChild(r);
  });
  dock.appendChild(kbd);

  function showTyped() {
    shown.textContent = field.value || "";
    shown.classList.toggle("empty", !field.value);
    shown.scrollLeft = shown.scrollWidth;
  }

  function press(k) {
    if (k.length === 1) {
      if (field.value.length >= 60) return;
      field.value = field.value.toUpperCase().replace(/[^A-Z]/g, "") + k;
      handleInput();
    } else if (k === "back") {
      if (!field.value) return;
      field.value = field.value.slice(0, -1);
      handleInput();
    } else if (k === "prev" || k === "next") {
      if (!insts.length) return;
      setFocus(focusIdx + (k === "prev" ? -1 : 1));
      Sound.browse();
    } else if (k === "hide") {
      setCollapsed(true);
      return;
    }
    showTyped();
  }

  let holdTimer = null;
  let holdRepeat = null;
  const stopHold = () => {
    clearTimeout(holdTimer);
    clearInterval(holdRepeat);
    holdTimer = holdRepeat = null;
  };

  kbd.addEventListener("pointerdown", (e) => {
    const b = e.target.closest(".key");
    if (!b) return;
    e.preventDefault();
    Sound.start();
    b.classList.add("pressed");
    const k = b.dataset.key;
    press(k);
    if (k === "back" || k === "prev" || k === "next") {
      holdTimer = setTimeout(() => { holdRepeat = setInterval(() => press(k), k === "back" ? 110 : 200); }, 450);
    }
  });
  const release = () => {
    stopHold();
    kbd.querySelectorAll(".key.pressed").forEach((b) => b.classList.remove("pressed"));
  };
  ["pointerup", "pointercancel", "pointerleave"].forEach((ev) => kbd.addEventListener(ev, release));
  kbd.addEventListener("contextmenu", (e) => e.preventDefault());

  shown.addEventListener("click", () => {
    if (document.body.classList.contains("kbd-collapsed")) setCollapsed(false);
  });

  function measure() {
    const dockTop = dock.getBoundingClientRect().top;
    const bottom = Math.max(0, Math.round(window.innerHeight - dockTop));
    const labelTop = Math.round(tools.getBoundingClientRect().bottom + 8);
    root.style.setProperty("--dock-h", `${bottom}px`);
    root.style.setProperty("--label-top", `${labelTop}px`);
    window.FIELD_FIT = { top: labelTop + label.offsetHeight + 8, bottom: bottom + 10 };
  }

  function relayout() {
    measure();
    if (typeof render === "function" && typeof insts !== "undefined") render();
  }

  function setCollapsed(on) {
    document.body.classList.toggle("kbd-collapsed", on);
    requestAnimationFrame(relayout);
  }

  window.addEventListener("resize", measure);
  window.addEventListener("keyup", showTyped);
  window.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (document.querySelector(".panel.show") && e.key !== "Backspace" && !/^[a-z]$/i.test(e.key)) return;
    if (/^[a-z]$/i.test(e.key)) { e.preventDefault(); press(e.key.toUpperCase()); }
    else if (e.key === "Backspace") { e.preventDefault(); press("back"); }
  });
  document.addEventListener("DOMContentLoaded", () => {
    measure();
    showTyped();
    requestAnimationFrame(relayout);
  });
  measure();
})();