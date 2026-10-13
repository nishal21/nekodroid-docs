(function () {
  // Fullscreen Lottie intro. Plays once per browser session.
  if (window.__ndIntro) return;
  window.__ndIntro = true;

  var KEY = "nd-intro-seen";
  var W = 1600, H = 1200;                 // composition size
  var BTN_X = 800, BTN_Y = 905;           // Get Started button center
  var BTN_W = 271.6, BTN_H = 64, PAD = 16; // button size + padding (composition units)
  var BTN_FRAME = 134;                    // frame where the button is fully visible
  var LOCAL_JSON = "/animations/intro.json";
  var CDN_JSON = "https://cdn.jsdelivr.net/gh/nishal21/nekodroid-docs@main/animations/intro.json";
  var LOTTIE_SRC = "https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js";

  try {
    if (sessionStorage.getItem(KEY)) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  } catch (e) { return; }

  var root = document.documentElement;
  var dark = root.classList.contains("dark") ||
    (!root.classList.contains("light") && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
  var fg = dark ? "#fafafa" : "#18181b";

  // Overlay covering the full viewport.
  var o = document.createElement("div");
  o.setAttribute("role", "dialog");
  o.setAttribute("aria-modal", "true");
  o.setAttribute("aria-label", "NekoDroid intro");
  o.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;height:100dvh;z-index:2147483647;" +
    "overflow:hidden;opacity:1;transition:opacity .25s ease;background:" + (dark ? "#0c0c0d" : "#ffffff");

  // Lottie container fills the viewport; Lottie's default xMidYMid meet letterboxes (contain).
  var stage = document.createElement("div");
  stage.setAttribute("aria-hidden", "true");
  stage.style.cssText = "position:absolute;inset:0;width:100%;height:100%";
  o.appendChild(stage);

  // Accessible hit target placed over the Lottie Get Started button.
  var cta = document.createElement("a");
  cta.href = "/";
  cta.textContent = "Get Started";
  cta.style.cssText = "position:absolute;z-index:2;display:block;border-radius:999px;color:transparent;" +
    "font-size:0;text-decoration:none;cursor:pointer;visibility:hidden;outline-offset:3px;outline-color:" + fg;
  o.appendChild(cta);

  // Skip control.
  var skip = document.createElement("button");
  skip.type = "button";
  skip.textContent = "Skip";
  skip.setAttribute("aria-label", "Skip intro");
  skip.style.cssText = "position:absolute;z-index:3;top:16px;right:16px;padding:6px 14px;border-radius:999px;" +
    "font:500 14px/1.4 system-ui,-apple-system,sans-serif;cursor:pointer;background:transparent;color:" + fg +
    ";border:1px solid " + (dark ? "#ffffff33" : "#18181b33");
  o.appendChild(skip);

  function layout() {
    var vw = o.clientWidth || window.innerWidth;
    var vh = o.clientHeight || window.innerHeight;
    var s = Math.min(vw / W, vh / H);
    var ox = (vw - W * s) / 2;
    var oy = (vh - H * s) / 2;
    var w = (BTN_W + PAD * 2) * s;
    var h = (BTN_H + PAD * 2) * s;
    cta.style.width = w + "px";
    cta.style.height = h + "px";
    cta.style.left = (ox + BTN_X * s - w / 2) + "px";
    cta.style.top = (oy + BTN_Y * s - h / 2) + "px";
  }

  var done = false, anim, failsafe;

  function close() {
    if (done) return;
    done = true;
    clearTimeout(failsafe);
    try { sessionStorage.setItem(KEY, "1"); } catch (e) {}
    document.removeEventListener("keydown", onKey, true);
    window.removeEventListener("resize", layout);
    root.classList.remove("nd-intro-active");
    o.style.opacity = "0";
    setTimeout(function () {
      if (anim) anim.destroy();
      if (o.parentNode) o.parentNode.removeChild(o);
    }, 260);
  }

  function showCta() {
    if (done || cta.style.visibility === "visible") return;
    cta.style.visibility = "visible";
    try { cta.focus({ preventScroll: true }); } catch (e) {}
  }

  function onKey(e) {
    if (e.key === "Escape") { e.preventDefault(); close(); }
  }

  cta.addEventListener("click", function (e) {
    var path = window.location.pathname.replace(/\/+$/, "") || "/";
    if (path === "/") { e.preventDefault(); close(); return; }
    try { sessionStorage.setItem(KEY, "1"); } catch (err) {}
  });
  skip.addEventListener("click", close);
  document.addEventListener("keydown", onKey, true);
  window.addEventListener("resize", layout);

  root.classList.add("nd-intro-active");
  root.appendChild(o);
  layout();

  // Close if loading takes too long.
  failsafe = setTimeout(close, 8000);

  function getJSON(url) {
    return fetch(url, { cache: "force-cache" }).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    });
  }

  var dataP = getJSON(LOCAL_JSON).catch(function () { return getJSON(CDN_JSON); });

  var lottieP = new Promise(function (resolve, reject) {
    if (window.lottie) return resolve(window.lottie);
    var s = document.createElement("script");
    s.src = LOTTIE_SRC;
    s.async = true;
    s.onload = function () { window.lottie ? resolve(window.lottie) : reject(new Error("lottie missing")); };
    s.onerror = reject;
    (document.head || root).appendChild(s);
  });

  Promise.all([lottieP, dataP]).then(function (res) {
    if (done) return;
    anim = res[0].loadAnimation({
      container: stage,
      renderer: "svg",
      loop: false,
      autoplay: false,
      animationData: res[1],
      rendererSettings: { preserveAspectRatio: "xMidYMid meet" }
    });
    anim.setSpeed(1.6);
    anim.addEventListener("DOMLoaded", function () {
      clearTimeout(failsafe);
      layout();
      anim.play();
    });
    anim.addEventListener("enterFrame", function () {
      if (anim.currentFrame >= BTN_FRAME) showCta();
    });
    anim.addEventListener("complete", showCta);
    anim.addEventListener("data_failed", close);
  }).catch(close);
})();
