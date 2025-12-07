# Scoreboards – Processes Documentation

These documents exist to give developers and AI tools enough context to work safely on the Scoreboards codebase without needing to reverse-engineer the app.

This app is **internal**, built for a **single client**, and will **never be public-facing**, so the documentation is intentionally simple and practical.

---

## What These Docs Cover

### 1. Architecture (`architecture.md`)

A high-level snapshot of:

- How the app is structured  

- The main pages  

- The data model (tables and fields)  

- How AI insights are generated  

- What parts of the system do *not* exist (cron jobs, heavy workflows)

### 2. Core Flows (`flows.md`)

A simple outline of how the key user actions work, including:

- Viewing the main Scoreboard

- Adding metrics

- Editing values

- Drag-and-drop ordering

- Viewing trends on the Individual Metric page

- AI insight generation

This file helps explain the actual *behaviour* of the system at a level useful for engineering decisions, debugging, and AI-assisted development.

---

## When to Update These Docs

Please update these files whenever:

- A new feature is added  

- A data model changes (new field, new table, name change, etc.)  

- A flow changes in a meaningful way (new UX, new rules, new logic)  

- AI insights change their structure or data sourcing  

Small cosmetic UI or design changes usually do **not** require updates.

---

## Why This Exists

Because Scoreboards is a small app with minimal workflows, even tiny changes can become unclear over time if not documented.  

These docs ensure:

- Developers always know how the system works  

- Cursor / AI dev tools have the right context  

- The architecture remains understandable  

- No logic becomes "tribal knowledge"

This folder is not meant to be exhaustive—only useful. Keep it short, correct, and up-to-date.


