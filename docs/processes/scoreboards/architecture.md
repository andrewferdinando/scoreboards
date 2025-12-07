# Scoreboards – Architecture Overview

Scoreboards is a small internal KPI-tracking app built for a single client. It is not a public-facing production system. The goal is to let a small group of users track key business metrics over time, compare performance year-on-year, and get simple AI-generated insights.

## Tech Stack

- **Frontend:** Next.js (Scoreboards UI)

- **Backend / Database:** Supabase (Postgres, auth, RLS)

- **Hosting:** Vercel

- **AI Insights:** ChatGPT / OpenAI API called from the app to analyse metric history and generate short insights.

## Main Pages

### 1. Scoreboard Page (Main)

The main Scoreboard page is where users:

- Select a **brand** (in practice there is currently only one client/brand).

- See a table of **metrics** for that brand.

- Can **add new metrics**.

- Can **enter or edit metric values** (e.g. by month and year).

- See a **traffic light importance** column for each metric (green / amber / red).

- Can **reorder metrics** via drag-and-drop for better visual hierarchy.

- Can click on a metric row to open the **Individual Metric Page**.

The data shown on this page is primarily driven by the `metrics` and `metric_values` tables for the selected brand (and often for a selected year).

### 2. Individual Metric Page

The Individual Metric page is opened when the user clicks a metric from the main Scoreboard page. For a single metric, this page shows:

- A **YoY (Year-on-Year) table** comparing that metric's numbers across years.

- A **YTD (Year-to-Date) cell** so users can quickly see the current year's progress.

- A **graph (trend chart)** of YoY performance based on historical values.

- An **AI insight** section where ChatGPT analyses the metric's historical data and returns a short written insight (e.g. trends, spikes, drops).

All of this uses the time-series data in `metric_values` for the selected `metric_id`.

## Data Model (Supabase)

Scoreboards uses a small set of tables and a view:

### brands

Represents client brands. Scoreboards is currently used for a single client, but the schema supports multiple brands.

- `id` (uuid, PK)

- `name` (text)

- `created_at` (timestamptz)

### metrics

Defines the metrics (KPIs) that appear on the Scoreboard for a brand.

- `id` (uuid, PK)

- `brand_id` (uuid, FK → brands.id)

- `name` (text) – name of the metric as shown in the UI.

- `data_source` (text, nullable) – optional description or system/source for the metric.

- `created_at` (timestamptz, default now())

- `importance` (text, default 'green') – traffic-light importance: typically 'green', 'amber', or 'red'.

- `sort_order` (integer, nullable) – used for drag-and-drop ordering in the Scoreboard UI.

### metric_values

Stores the numeric values for each metric over time.

- `id` (uuid, PK)

- `metric_id` (uuid, FK → metrics.id)

- `year` (integer) – e.g. 2024, 2025.

- `month` (integer) – 1–12.

- `value` (numeric) – the metric's value for that metric/year/month.

This table is used by both:

- The **main Scoreboard** (to show current values).

- The **Individual Metric page** (to build YoY tables, YTD values, and trend graphs).

### staging_metric_values

Helper table for staging/importing metric values (e.g. from CSV or other sources).

- `metric_name` (text)

- `year` (integer)

- `month` (integer)

- `value` (numeric)

This is used as a temporary holding area and is not part of the core user-facing flows.

### profiles

Represents user profiles.

- `id` (uuid) – matches the Supabase auth user id.

- `email` (text)

- `created_at` (timestamptz)

- `name` / `Name` (text) – user's display name (one of these is used in practice).

- `is_super_admin` (boolean, default false) – indicates super admin users.

### brand_memberships

Links users to brands and defines their role.

- `brand_id` (uuid, FK → brands.id)

- `user_id` (uuid, FK → profiles.id / auth.users.id)

- `role` (text, default 'member')

### v_user_brand_access

A view used to simplify checking which brands a user can access.

- `brand_id` (uuid)

- `user_id` (uuid)

## Behaviour & Integrations

- All read/write operations happen via the frontend calling Supabase directly.

- There are **no cron jobs or scheduled background tasks** specific to Scoreboards at this time.

- AI insights for the Individual Metric page are generated on demand using ChatGPT/OpenAI API based on the historical data in `metric_values`.

This document exists purely to give AI tools and developers enough context to work safely on the Scoreboards codebase without guessing how things are structured.
