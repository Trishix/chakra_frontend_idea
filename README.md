# Chakra

Chakra is a React + TypeScript + Vite frontend prototype by **team dot_gitignore** for reviewing fictional investigation records. Its three screens are **Cases**, **Investigation**, and **Reports**.

**Demonstration data. Fictional records.** No genuine case or victim data is included. Chakra has no authentication or backend and makes no production security guarantee. Role and access states are demonstrations. This project is not endorsed by NIC.

## Run locally

Use Node.js 20.19+ or 22.12+ and npm.

```sh
npm install
npm run dev
```

Open **http://localhost:5173**. The development server binds to the local machine.

```sh
npm run build
npm test
npm run test:browser
```

Browser tests use Playwright. Install its Chromium browser on a new machine with `npx playwright install chromium` if needed. `npm run build` checks TypeScript and creates the static site in `dist/`. Run `npm run preview -- --port 5173` to serve that build locally at http://localhost:5173; stop the development server first if it uses the same port.

## Demo walkthrough

1. In **Cases**, open a fictional case to enter its investigation workspace.
2. Inspect a lead and its linked evidence. Compare source excerpts, dates and relationships, and distinguish inferred links from documented connections.
3. Add reviewer notes and mark a lead reviewed. Dismiss another lead to demonstrate that review decisions are explicit user actions.
4. Open **Reports**, select reviewed leads, add report notes and save a report snapshot.
5. Download the snapshot as a PDF. The document includes case and report references, review notes, lead statuses, available source excerpts, document page ranges, limitations and page numbers.

Importing a demonstration pack merges its predefined fictional records. Reimporting the same pack is idempotent: it does not create duplicate records. The import is a local demonstration, not a connection to a police system or external data provider.

## Data and behavior

- The copilot uses deterministic local responses and rules. It is not AI and does not call a model service.
- Fictional application data, review decisions and report snapshots persist in this browser's `localStorage`. The reset control restores the original demonstration data; clearing this site's browser storage also removes local saved state.
- Attachments are session-only previews. Their contents are not analyzed, included in saved reports or sent to a server; reload ends the preview session.
- A saved report is a snapshot. Subsequent lead edits do not change it. PDF generation runs locally with the bundled jsPDF library and omits restricted source records. Source page ranges cover the whole document because excerpts have no verified exact-page mapping.
- Runtime assets and dependencies are served locally, including fonts and the PDF module. The application has no outbound runtime service dependency. After installing dependencies and building, serve `dist/` locally to use it without internet access. Initial package and browser installation requires access to their registries; opening `dist/index.html` directly is not the supported deployment method.

This prototype is for demonstrating workflows with fictional data. Its local access restrictions and browser storage are not a secure environment for operational case records.
