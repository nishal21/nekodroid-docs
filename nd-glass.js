/**
 * Liquid Glass on overview mascot + GitHub button only (not cards).
 * CSS glass always; WebGL LiquidGlass when safe.
 * https://liquid-glass.ybouane.com/
 */
(function () {
  "use strict";

  if (window.__ndGlass) return;
  window.__ndGlass = true;

  var CDN =
    "https://cdn.jsdelivr.net/npm/@ybouane/liquidglass@1.0.3/dist/index.js";

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  }

  function hasWebGL() {
    try {
      var c = document.createElement("canvas");
      return !!(c.getContext("webgl") || c.getContext("experimental-webgl"));
    } catch (e) {
      return false;
    }
  }

  function shouldEnhance() {
    if (!hasWebGL()) return false;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return false;
    }
    if (window.matchMedia("(max-width: 900px)").matches) return false;
    if (window.matchMedia("(pointer: coarse)").matches) return false;
    if (navigator.connection && navigator.connection.saveData) return false;
    return true;
  }

  function findRoot() {
    return document.getElementById("nd-glass-root");
  }

  function initCssGlass(root) {
    root.classList.add("nd-glass-css");
  }

  function bootLiquidGlass(root) {
    if (!root.querySelector(":scope > .glass")) return;

    var mod = document.createElement("script");
    mod.type = "module";
    mod.textContent =
      'import { LiquidGlass } from "' +
      CDN +
      '";\n' +
      "const root = document.getElementById('nd-glass-root');\n" +
      "if (!root || root.dataset.ndGlassLive === '1') throw new Error('skip');\n" +
      "root.dataset.ndGlassLive = '1';\n" +
      "root.classList.add('nd-glass-live');\n" +
      "window.__ndGlassInstance = await LiquidGlass.init({\n" +
      "  root,\n" +
      "  glassElements: root.querySelectorAll(':scope > .glass')\n" +
      "});\n";

    mod.onerror = function () {
      root.classList.remove("nd-glass-live");
      delete root.dataset.ndGlassLive;
      initCssGlass(root);
    };

    document.head.appendChild(mod);
  }

  function run() {
    var root = findRoot();
    if (!root) return;

    initCssGlass(root);
    if (!shouldEnhance()) return;

    window.setTimeout(function () {
      if (!findRoot()) return;
      try {
        bootLiquidGlass(root);
      } catch (e) {
        initCssGlass(root);
      }
    }, 140);
  }

  ready(run);

  var obs = new MutationObserver(function () {
    var root = findRoot();
    if (!root || root.dataset.ndGlassLive === "1") return;
    if (root.classList.contains("nd-glass-css")) return;
    run();
  });

  ready(function () {
    obs.observe(document.body, { childList: true, subtree: true });
  });
})();
