// Generates the static site from content/cv.json. No dependencies.
// Usage: node scripts/build.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "site");
const cv = JSON.parse(readFileSync(join(root, "content", "cv.json"), "utf8"));

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const origin = `https://${cv.site.domain}`;
const pdfName = cv.site.pdf;

const icons = {
  sun: '<svg class="sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  moon: '<svg class="moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
  download: '<svg viewBox="0 0 24 24" aria-hidden="true" style="fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg>',
  home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4V21H3zM9.5 9.5h3.8v1.6h.1c.5-1 1.8-1.9 3.7-1.9 4 0 4.7 2.6 4.7 6V21h-4v-5c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V21h-4z"/></svg>',
  github: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" aria-hidden="true" style="fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><path d="M3 5h18v14H3zM3 7l9 6 9-6"/></svg>',
};

// Applies the saved or system theme before first paint to avoid a flash.
const themeInit =
  "<script>(function(){var t=null;try{t=localStorage.getItem('theme')}catch(e){}" +
  "if(!t)t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';" +
  "document.documentElement.setAttribute('data-theme',t)})()</script>";

const toggle = `<button class="pill" id="theme-toggle" type="button" aria-label="Toggle light and dark mode">${icons.sun}${icons.moon}<span>Theme</span></button>`;

function head({ title, description, path, base }) {
  const url = origin + path;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="color-scheme" content="light dark">
<link rel="canonical" href="${url}">
<link rel="icon" href="${base}favicon.svg" type="image/svg+xml">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta name="twitter:card" content="summary">
${themeInit}
<link rel="preload" href="${base}assets/fonts/inter-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${base}assets/style.css">
</head>`;
}

const actionButtons = (base) => `
      <div class="actions">
        <a class="btn primary" href="${esc(cv.links.linkedin)}" target="_blank" rel="noopener">${icons.mail}Contact me</a>
        <a class="btn" href="${esc(cv.links.linkedin)}" target="_blank" rel="noopener">${icons.linkedin}LinkedIn</a>
        <a class="btn" href="${esc(cv.links.github)}" target="_blank" rel="noopener">${icons.github}GitHub</a>
      </div>`;

const highlights = () =>
  `<div class="highlights">\n${cv.highlights
    .map((h) => `        <div class="hl"><b>${esc(h.title)}</b><span>${esc(h.text)}</span></div>`)
    .join("\n")}\n      </div>`;

const pdfButton = (base) =>
  `<a class="pill" href="${base}${pdfName}" download>${icons.download}Download PDF</a>`;

function landing() {
  const desc = `${cv.name}, ${cv.title}. ${cv.pitch}`;
  return `${head({ title: `${cv.name} – ${cv.title}`, description: desc, path: "/", base: "" })}
<body>
<div class="topbar">
  <div class="left"></div>
  <div class="right">${toggle}</div>
</div>
<div class="page">
  <header class="hero">
    <h1>${esc(cv.name)}</h1>
    <p class="title">${esc(cv.title)} · ${esc(cv.subtitle)}</p>
    <p class="loc">${esc(cv.location)}</p>
    <p style="margin:18px 0 0;font-size:18px;max-width:34em">${esc(cv.pitch)}</p>
    <div class="actions">
      <a class="btn primary" href="cv/">View CV</a>
      <a class="btn" href="${pdfName}" download>${icons.download}Download PDF</a>
      <a class="btn" href="${esc(cv.links.linkedin)}" target="_blank" rel="noopener">${icons.mail}Contact me</a>
      <a class="btn" href="${esc(cv.links.github)}" target="_blank" rel="noopener">${icons.github}GitHub</a>
    </div>
  </header>
  <main>
    <section>
      <h2>About</h2>
      <p class="summary">${esc(cv.summary)}</p>
      ${highlights()}
    </section>
    <section>
      <h2>Currently</h2>
      <p>${esc(cv.experience[0].role)} at <b>${esc(cv.experience[0].company)}</b> · ${esc(cv.experience[0].location)}</p>
      <p class="stack"><b>Stack:</b> ${esc(cv.experience[0].stack)}</p>
    </section>
  </main>
</div>
<script src="assets/theme.js"></script>
</body>
</html>
`;
}

function cvPage() {
  const jobs = cv.experience
    .map(
      (j, i) => `
      <div class="job${i === 1 ? " page-break" : ""}">
        <div class="job-head">
          <h3>${esc(j.role)} · <span class="co">${esc(j.company)}</span></h3>
          <span class="when">${esc(j.period)}</span>
        </div>
        <div class="where">${esc(j.location)}</div>
        <p class="ctx">${esc(j.context)}</p>
        <ul>
${j.bullets.map((b) => `          <li>${esc(b)}</li>`).join("\n")}
        </ul>
        <div class="stack"><b>Stack:</b> ${esc(j.stack)}</div>
      </div>`
    )
    .join("\n");

  const skills = cv.skills
    .map(
      (g) =>
        `        <dt>${esc(g.group)}</dt>\n        <dd>${g.items
          .map((i) => `<span class="tag${i.primary ? " primary" : ""}">${esc(i.name)}</span>`)
          .join("")}</dd>`
    )
    .join("\n");

  const certs = cv.certifications
    .map((c) => `        <div class="row"><span><b>${esc(c.name)}</b></span><span>${esc(c.date)}</span></div>`)
    .join("\n");
  const edu = cv.education
    .map(
      (e) =>
        `        <div class="row"><span><b>${esc(e.name)}</b><br>${esc(e.school)}</span><span>${esc(e.date)}</span></div>`
    )
    .join("\n");

  return `${head({
    title: `${cv.name} – CV`,
    description: `CV of ${cv.name}, ${cv.title}. ${cv.subtitle}.`,
    path: "/cv/",
    base: "../",
  })}
<body>
<div class="topbar">
  <div class="left"><a class="pill" href="../">${icons.home}Home</a></div>
  <div class="right">${pdfButton("../")}${toggle}</div>
</div>
<div class="page">
  <header class="hero">
    <h1>${esc(cv.name)}</h1>
    <p class="title">${esc(cv.title)} · ${esc(cv.subtitle)}</p>
    <p class="loc">${esc(cv.location)}</p>${actionButtons("../")}
  </header>

  <main>
    <section>
      <h2>Profile</h2>
      <p class="summary">${esc(cv.summary)}</p>
      ${highlights()}
    </section>

    <section>
      <h2>Experience</h2>
${jobs}
    </section>

    <section>
      <h2>Technical Skills</h2>
      <dl class="skills">
${skills}
      </dl>
    </section>

    <div class="two">
      <section>
        <h2>Certifications</h2>
${certs}
      </section>
      <section>
        <h2>Education</h2>
${edu}
      </section>
    </div>
  </main>
</div>
<script src="../assets/theme.js"></script>
</body>
</html>
`;
}

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#12306b"/><text x="32" y="43" font-family="Inter,Arial,sans-serif" font-size="30" font-weight="700" text-anchor="middle" fill="#fff">AM</text></svg>
`;

mkdirSync(join(out, "cv"), { recursive: true });
writeFileSync(join(out, "index.html"), landing());
writeFileSync(join(out, "cv", "index.html"), cvPage());
writeFileSync(join(out, "favicon.svg"), favicon);
writeFileSync(join(out, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`);
writeFileSync(
  join(out, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${origin}/</loc></url>\n  <url><loc>${origin}/cv/</loc></url>\n</urlset>\n`
);
console.log("Built site into", out);
