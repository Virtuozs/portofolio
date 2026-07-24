function formatClock(now: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

export function mountStatusBar(root: HTMLElement): void {
  root.replaceChildren();

  const availability = document.createElement("span");
  availability.className = "statusbar__availability";

  const blip = document.createElement("span");
  blip.className = "statusbar__blip";
  blip.setAttribute("aria-hidden", "true");

  const availabilityText = document.createElement("span");
  availabilityText.textContent = "open to opportunities";

  availability.append(blip, availabilityText);

  const clock = document.createElement("span");
  clock.className = "statusbar__clock";
  clock.setAttribute("aria-hidden", "true"); // decorative; the time is not actionable

  const tick = () => {
    clock.textContent = formatClock(new Date());
  };
  tick();
  window.setInterval(tick, 1000);

  root.append(availability, clock);
}
