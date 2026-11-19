# Intelligence Into Imagination — Vercel static + API build

Upload these files to the root of the existing GitHub repo, replacing the current files.

Structure:
- index.html — static homepage
- api/imagine.js — Vercel serverless API only
- package.json — no app/server entrypoint

Vercel automatically serves index.html and maps api/imagine.js to /api/imagine.

Required Vercel Secret: OPENAI_API_KEY
Optional: OPENAI_MODEL=gpt-5-mini
