(function () {
  "use strict";

  // Fullscreen cover Lottie intro — once per browser session.
  if (window.__ndIntro) return;
  window.__ndIntro = true;

  var KEY = "nd-intro-seen";
  var W = 1600;
  var H = 1200;
  var BTN_X = 800;
  var BTN_Y = 905;
  var BTN_W = 271.6;
  var BTN_H = 64;
  var PAD = 18;
  var BTN_FRAME = 134;
  var LOCAL_JSON = "/animations/intro.json";
  var CDN_JSON =
    "https://cdn.jsdelivr.net/gh/nishal21/nekodroid-docs@main/animations/intro.json";
  var LOTTIE_SRC =
    "https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js";

  try {
    if (sessionStorage.getItem(KEY)) return;
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      sessionStorage.setItem(KEY, "1");
      return;
    }
  } catch (e) {
    /* still show once this load */
  }

  var root = document.documentElement;
  var dark =
    root.classList.contains("dark") ||
    root.getAttribute("data-theme") === "dark" ||
    (!root.classList.contains("light") &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  // Kill Mintlify's green focus ring for intro controls only.
  var css = document.createElement("style");
  css.id = "nd-intro-css";
  css.textContent =
    "html.nd-intro-active,html.nd-intro-active body{overflow:hidden!important;height:100%!important;touch-action:none}" +
    "#nd-intro-root{position:fixed;inset:0;width:100vw;height:100vh;height:100dvh;z-index:2147483647;" +
    "overflow:hidden;opacity:1;transition:opacity .3s ease;background:" +
    (dark ? "#0c0c0d" : "#ececec") +
    ";-webkit-tap-highlight-color:transparent}" +
    "#nd-intro-root.nd-exit{opacity:0;pointer-events:none}" +
    "#nd-intro-stage{position:absolute;inset:0;width:100%;height:100%;line-height:0}" +
    "#nd-intro-stage svg,#nd-intro-stage canvas{display:block!important;width:100%!important;height:100%!important}" +
    "#nd-intro-cta,#nd-intro-skip,#nd-intro-cta:focus,#nd-intro-cta:focus-visible," +
    "#nd-intro-skip:focus,#nd-intro-skip:focus-visible{outline:none!important;box-shadow:none!important}" +
    "#nd-intro-cta{position:absolute;z-index:2;display:block;border:0;border-radius:999px;" +
    "padding:0;margin:0;background:transparent;color:transparent;font-size:0;line-height:0;" +
    "text-decoration:none;cursor:pointer;opacity:0;pointer-events:none;transition:opacity .2s ease}" +
    "#nd-intro-cta.nd-ready{opacity:1;pointer-events:auto}" +
    "#nd-intro-skip{position:absolute;z-index:3;top:max(.75rem,env(safe-area-inset-top));" +
    "right:max(.75rem,env(safe-area-inset-right));appearance:none;border:1px solid " +
    (dark ? "rgba(255,255,255,.22)" : "rgba(15,15,16,.18)") +
    ";background:transparent;color:" +
    (dark ? "rgba(255,255,255,.7)" : "rgba(15,15,16,.55)") +
    ";font:500 .8125rem/1 system-ui,-apple-system,sans-serif;padding:.45rem .85rem;" +
    "border-radius:999px;cursor:pointer}";

  var o = document.createElement("div");
  o.id = "nd-intro-root";
  o.setAttribute("role", "dialog");
  o.setAttribute("aria-modal", "true");
  o.setAttribute("aria-label", "NekoDroid intro");

  var stage = document.createElement("div");
  stage.id = "nd-intro-stage";
  stage.setAttribute("aria-hidden", "true");

  var cta = document.createElement("a");
  cta.id = "nd-intro-cta";
  cta.href = "/";
  cta.setAttribute("aria-label", "Get started — go to home");
  cta.tabIndex = -1;

  var skip = document.createElement("button");
  skip.id = "nd-intro-skip";
  skip.type = "button";
  skip.textContent = "Skip";
  skip.setAttribute("aria-label", "Skip intro");

  o.appendChild(stage);
  o.appendChild(cta);
  o.appendChild(skip);
  root.appendChild(css);
  (document.body || root).appendChild(o);
  root.classList.add("nd-intro-active");

  var done = false;
  var anim = null;
  var failsafe = null;

  function markSeen() {
    try {
      sessionStorage.setItem(KEY, "1");
    } catch (e) {}
  }

  // Cover (slice): fill viewport, crop overflow — no black bars.
  function layout() {
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var s = Math.max(vw / W, vh / H);
    var ox = (vw - W * s) / 2;
    var oy = (vh - H * s) / 2;
    var w = (BTN_W + PAD * 2) * s;
    var h = (BTN_H + PAD * 2) * s;
    cta.style.width = w + "px";
    cta.style.height = h + "px";
    cta.style.left = ox + BTN_X * s - w / 2 + "px";
    cta.style.top = oy + BTN_Y * s - h / 2 + "px";
  }

  function close(goHome) {
    if (done) return;
    done = true;
    markSeen();
    clearTimeout(failsafe);
    document.removeEventListener("keydown", onKey, true);
    window.removeEventListener("resize", layout);
    window.removeEventListener("orientationchange", layout);
    o.classList.add("nd-exit");
    root.classList.remove("nd-intro-active");
    setTimeout(function () {
      try {
        if (anim) anim.destroy();
      } catch (e) {}
      if (o.parentNode) o.parentNode.removeChild(o);
      if (css.parentNode) css.parentNode.removeChild(css);
      if (goHome) {
        var path = (location.pathname || "/").replace(/\/+$/, "") || "/";
        if (path !== "/" && path !== "/index") location.assign("/");
      }
    }, 320);
  }

  function showCta() {
    if (done) return;
    clearTimeout(failsafe);
    cta.classList.add("nd-ready");
    // Do not focus — Mintlify theme draws a green focus ring.
  }

  function onKey(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      close(false);
    }
  }

  cta.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    close(true);
  });
  skip.addEventListener("click", function (e) {
    e.preventDefault();
    close(false);
  });
  document.addEventListener("keydown", onKey, true);
  window.addEventListener("resize", layout);
  window.addEventListener("orientationchange", layout);
  layout();

  failsafe = setTimeout(function () {
    if (!done) close(false);
  }, 16000);

  function getJSON(url) {
    return fetch(url, { cache: "force-cache" }).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    });
  }

  var dataP = getJSON(LOCAL_JSON).catch(function () {
    return getJSON(CDN_JSON);
  });

  var lottieP = new Promise(function (resolve, reject) {
    if (window.lottie) return resolve(window.lottie);
    var s = document.createElement("script");
    s.src = LOTTIE_SRC;
    s.async = true;
    s.onload = function () {
      window.lottie ? resolve(window.lottie) : reject(new Error("lottie missing"));
    };
    s.onerror = reject;
    (document.head || root).appendChild(s);
  });

  Promise.all([lottieP, dataP])
    .then(function (res) {
      if (done) return;
      anim = res[0].loadAnimation({
        container: stage,
        renderer: "svg",
        loop: false,
        autoplay: false,
        animationData: res[1],
        rendererSettings: {
          // Cover the viewport — crop edges instead of letterboxing.
          preserveAspectRatio: "xMidYMid slice",
          progressiveLoad: true,
          hideOnTransparent: true,
        },
      });
      anim.setSpeed(1.45);
      anim.addEventListener("DOMLoaded", function () {
        if (done) return;
        clearTimeout(failsafe);
        failsafe = setTimeout(function () {
          if (!done) close(false);
        }, 14000);
        layout();
        anim.play();
      });
      anim.addEventListener("enterFrame", function () {
        if (anim.currentFrame >= BTN_FRAME) showCta();
      });
      anim.addEventListener("complete", showCta);
      anim.addEventListener("data_failed", function () {
        close(false);
      });
    })
    .catch(function () {
      close(false);
    });
})();
