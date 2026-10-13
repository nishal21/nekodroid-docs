export const Intro = () => {
  const ref = React.useRef(null);
  const [failed, setFailed] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setFailed(true); return; }
    let anim; let cancelled = false;
    const start = () => {
      if (cancelled || !ref.current || !window.lottie) { setFailed(true); return; }
      anim = window.lottie.loadAnimation({ container: ref.current, renderer: "svg", loop: false, autoplay: true, path: "https://cdn.jsdelivr.net/gh/nishal21/nekodroid-docs@main/animations/intro.json" });
      anim.addEventListener("data_failed", () => setFailed(true));
    };
    if (window.lottie) start();
    else {
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js";
      s.async = true; s.onload = start; s.onerror = () => setFailed(true);
      document.head.appendChild(s);
    }
    return () => { cancelled = true; if (anim) anim.destroy(); };
  }, []);
  if (failed) return <img src="/logo/favicon.svg" alt="" className="nd-hero-mark" noZoom />;
  return <div ref={ref} className="nd-intro" aria-hidden="true" />;
};
