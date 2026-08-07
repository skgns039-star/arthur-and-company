(() => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  document.querySelectorAll(".rail").forEach((rail) => {
    let paused = false;
    const pause = () => { paused = true; };
    const resume = () => { paused = false; };
    rail.addEventListener("pointerenter", pause);
    rail.addEventListener("pointerleave", resume);
    rail.addEventListener("focusin", pause);
    rail.addEventListener("focusout", resume);
    window.setInterval(() => {
      if (paused || document.hidden) return;
      const step = Math.max(rail.clientWidth * 0.72, 280);
      const atEnd = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 4;
      rail.scrollTo({ left: atEnd ? 0 : rail.scrollLeft + step, behavior: "smooth" });
    }, 4500);
  });
})();
