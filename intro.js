(function () {
  try {
    if (window.__ndIntro) return; window.__ndIntro = true;
    if (sessionStorage.getItem("nd-intro-seen")) return;
    sessionStorage.setItem("nd-intro-seen", "1");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  } catch (e) { return; }
  var dark = document.documentElement.classList.contains("dark") ||
    (!document.documentElement.classList.contains("light") && window.matchMedia("(prefers-color-scheme: dark)").matches);
  var o = document.createElement("div");
  o.setAttribute("role", "dialog"); o.setAttribute("aria-label", "NekoDroid intro");
  o.style.cssText = "position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:opacity .2s ease;background:" + (dark ? "#0c0c0d" : "#ffffff");
  var box = document.createElement("div");
  box.style.cssText = "position:relative;width:min(720px,90vw);aspect-ratio:4/3;border-radius:16px;overflow:hidden";
  var cta = document.createElement("a");
  cta.href = "/quickstart"; cta.setAttribute("aria-label", "Get started with NekoDroid");
  cta.style.cssText = "position:absolute;left:40%;top:71%;width:20%;height:8.5%;border-radius:999px;z-index:2;display:none;outline-offset:3px";
  cta.addEventListener("click", function (e) { e.stopPropagation(); close(); });
  box.appendChild(cta);
  o.appendChild(box);
  document.documentElement.appendChild(o);
  var done = false, anim;
  function close() {
    if (done) return; done = true;
    o.style.opacity = "0";
    document.removeEventListener("keydown", onKey);
    setTimeout(function () { if (anim) anim.destroy(); o.remove(); }, 220);
  }
  function onKey(e) { if (e.key === "Escape") close(); }
  o.addEventListener("click", close);
  document.addEventListener("keydown", onKey);
  var failsafe = setTimeout(close, 3000);
  function start() {
    if (done || !window.lottie) return close();
    anim = window.lottie.loadAnimation({ container: box, renderer: "svg", loop: false, autoplay: false,
      path: "https://cdn.jsdelivr.net/gh/nishal21/nekodroid-docs@main/animations/intro.json" });
    anim.setSpeed(1.6);
    anim.addEventListener("DOMLoaded", function () { clearTimeout(failsafe); failsafe = setTimeout(close, 8000); anim.play(); });
    anim.addEventListener("complete", function () { clearTimeout(failsafe); cta.style.display = "block"; cta.focus({ preventScroll: true }); failsafe = setTimeout(close, 6000); });
    anim.addEventListener("data_failed", close);
  }
  if (window.lottie) start();
  else {
    var s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js";
    s.onload = start; s.onerror = close;
    document.head.appendChild(s);
  }
})();
