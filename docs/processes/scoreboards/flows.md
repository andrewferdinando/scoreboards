# Scoreboards – Core Flows

This file gives a very simple overview of the main user flows in the Scoreboards app so developers and AI tools have enough context to work safely on the codebase.

---

## Conventions

- **Brand:** In practice there is only one client/brand, but the schema supports multiple brands via `brands`, `brand_memberships` and `v_user_brand_access`.

- **Metrics:** Defined in the `metrics` table and linked to a brand.

- **Metric values:** Stored in `metric_values` by year + month and used across the app.

- **Auth:** Users are authenticated via Supabase, with profile details in `profiles`.

---

## 1. Main Scoreboard Page

### 1.1 View Scoreboard for a Brand and Year

1. User logs in and is associated with one or more brands via `brand_memberships` / `v_user_brand_access`.

2. User selects a brand (if more than one) and a year (e.g. 2024, 2025, 2026).

3. Frontend queries:

   - `metrics` for that `brand_id`, ordered by `sort_order`.

   - `metric_values` for those `metric_id`s and the selected `year`.

4. UI renders a table of metrics with:

   - Metric name

   - Importance (traffic light)

   - Current values per month (or latest known value for that year)

   - Actions (edit, delete, open individual metric).

### 1.2 Add a New Metric

1. User clicks "Add Metric" on the Scoreboard page.

2. UI shows a simple form (e.g. metric name, optional data_source, initial importance).

3. On submit, the app inserts a new row into `metrics` with:

   - `brand_id`

   - `name`

   - `data_source` (optional)

   - `importance` (default 'green' unless set)

   - `sort_order` (typically set to end of the list).

4. UI re-queries `metrics` and refreshes the table.

### 1.3 Edit a Metric (Name / Data Source / Importance)

1. User clicks to edit a metric row.

2. UI shows an edit form (inline or modal) allowing updates such as:

   - `name`

   - `data_source`

   - `importance` (green / amber / red)

3. On submit, the app updates the corresponding row in `metrics`.

4. UI refreshes the Scoreboard data.

### 1.4 Set / Change Traffic Light Importance

1. For each metric row, the user can set or change the importance to green / amber / red.

2. UI updates the `importance` field in `metrics`.

3. The Scoreboard table immediately reflects the new traffic light status.

### 1.5 Add or Edit Metric Values (Year / Month)

1. For a given metric on the Scoreboard, the user can add or edit numeric values for specific months in a specific year.

2. UI sends an upsert-style operation on `metric_values` with:

   - `metric_id`

   - `year`

   - `month`

   - `value`

3. The Scoreboard refreshes to show updated numbers for that metric and year.

4. These values are later reused by the YoY table, YTD calculation, and trend graph on the Individual Metric page.

### 1.6 Reorder Metrics (Drag and Drop)

1. User drags a metric row up or down in the Scoreboard table.

2. UI calculates new `sort_order` values for the affected metrics.

3. The app updates `metrics.sort_order` for those rows in Supabase.

4. The Scoreboard re-renders with the new order (sorted by `sort_order`).

### 1.7 Navigate to Individual Metric Page

1. User clicks on a metric row or a "View details" action.

2. UI routes to the Individual Metric page, passing the `metric_id` (and often retaining a selected year).

3. The Individual Metric page loads detailed time-series data from `metric_values` for that metric.

---

## 2. Individual Metric Page

### 2.1 View YoY Table and YTD Cell

1. Page loads with a specific `metric_id`.

2. UI queries `metric_values` for that `metric_id` across multiple years and months.

3. Data is transformed into a **YoY (Year-on-Year) table**, for example:

   - Columns: Year (e.g. 2022, 2023, 2024, 2025)

   - Rows: Months (1–12) and possibly a total row.

4. A **YTD (Year-to-Date) cell** is calculated for the current year by summing values up to the current month.

5. The table and YTD cell are displayed so the user can quickly compare performance across years.

### 2.2 View YoY Trend Graph

1. Using the same `metric_values` query, the app transforms data into a time series (e.g. by month).

2. A chart library renders a **trend graph**:

   - X-axis: time (months/years)

   - Y-axis: metric value

3. This graph visually shows trends, spikes, and dips for the selected metric across years.

### 2.3 Generate AI Insight from Metric History

1. After loading data for the metric, the frontend (or an API route) formats the historical values from `metric_values` into a prompt payload.

2. The app calls ChatGPT / OpenAI with:

   - Metric name and context

   - Relevant years and values

   - Any additional hints (e.g. "summarise key patterns and notable changes").

3. ChatGPT returns a short insight text (e.g. "Revenue has grown steadily year-on-year except for a dip in March 2024…").

4. The UI displays this insight in an **AI Insight** panel alongside the chart and YoY table.

5. Optionally, there may be a "Refresh insight" action to re-call the AI after data changes.

---

## 3. Data Import / Staging (Optional Flow)

### 3.1 Using `staging_metric_values`

1. When importing or bulk loading metrics from an external source, data can be inserted into `staging_metric_values` with:

   - `metric_name`

   - `year`

   - `month`

   - `value`

2. A script or process can then:

   - Match `staging_metric_values.metric_name` to `metrics.name` for a given brand.

   - Insert the corresponding rows into `metric_values`.

3. After successful import, staged rows can be cleared or ignored.

---

## 4. Access Control Overview

1. Users authenticate via Supabase auth (`profiles` holds profile info).

2. `brand_memberships` links users to brands and assigns a `role` (e.g. 'member').

3. `v_user_brand_access` is used to determine which brands a user can see.

4. In practice, Scoreboards is currently used for a single client, but this access model allows multiple brands if needed in future.

This document is intentionally simple. It exists to give developers and AI tools a clear picture of the main flows without needing to reverse-engineer the entire codebase.
