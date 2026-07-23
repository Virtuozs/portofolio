import type { ContentRenderer } from "../windowChrome.ts";

// [CONTENT GAP] Placeholder whoami content - NOT the owner's real single-page
// copy (which is not in this repo). Replace before deploy.
const LOGO = ` .--.
|o_o |
|:_/ |
//   \\ \\
(|     | )
/'\\_   _/\`\\
\\___)=(___/`;

const FIELDS: Array<[string, string]> = [
  ["role", "Backend / Infrastructure Engineer"],
  ["languages", "Python, Go, C++, JavaScript"],
  ["focus", "Linux and server fundamentals, self-hosted infra"],
  ["infra", "VPS with WireGuard + Caddy"],
  ["location", "placeholder - pending from site owner"],
  ["status", "open to opportunities"],
];

export const renderWhoami: ContentRenderer = (_win, el) => {
  el.classList.add("whoami");

  const logo = document.createElement("pre");
  logo.className = "whoami__logo";
  logo.textContent = LOGO;

  const info = document.createElement("div");
  for (const [key, value] of FIELDS) {
    const row = document.createElement("div");
    row.className = "whoami__row";
    const k = document.createElement("span");
    k.className = "whoami__key";
    k.textContent = `${key}:`;
    const v = document.createElement("span");
    v.textContent = value;
    row.append(k, v);
    info.appendChild(row);
  }

  el.append(logo, info);
};
