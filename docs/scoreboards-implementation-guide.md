# Scoreboards Implementation Guide for Cursor

**Product:** Scoreboards  
**Purpose:** Detailed page specifications and component breakdown  
**Author:** Manus AI  
**Version:** 1.0

---

## Overview

This implementation guide provides pixel-perfect specifications for building the Scoreboards application based on the provided mockups. It includes detailed breakdowns of both core pages, component hierarchies, data structures, and interaction patterns that Cursor can use to generate production-ready code.

---

## Page 1: Scoreboard Page

### Layout Structure

The Scoreboard page displays a grid where metrics are rows and months are columns. This is the primary view where users enter and review their business metrics.

**Page Hierarchy:**

```
<Page>
  <Header>
    <Title>Scoreboard</Title>
    <Actions>
      <Button variant="primary">Add Metric</Button>
    </Actions>
  </Header>
  <MainContent>
    <DataGrid>
      <TableHeader>
        <Column>Metric</Column>
        <Column>Data Source</Column>
        <Column>Jan</Column>
        <Column>Feb</Column>
        ...
        <Column>Dec</Column>
      </TableHeader>
      <TableBody>
        {metrics.map(metric => (
          <MetricRow metric={metric} />
        ))}
      </TableBody>
    </DataGrid>
  </MainContent>
</Page>
```

### Header Specifications

**Title:**
- Text: "Scoreboard"
- Font size: 36px (--text-h1-size)
- Font weight: 700
- Color: --color-neutral-900
- Position: Top-left of page
- Margin bottom: 32px

**Add Metric Button:**
- Position: Top-right of page
- Variant: Primary (gradient background)
- Text: "Add Metric"
- Padding: 8px 16px
- Border radius: 8px
- Font size: 14px
- Font weight: 600

### Data Grid Specifications

**Container:**
- Background: white
- Border: 1px solid --color-border-default
- Border radius: 12px
- Box shadow: --shadow-sm
- Overflow: auto (for horizontal scroll on smaller screens)

**Table Header:**
- Background: --color-neutral-50
- Border bottom: 1px solid --color-border-default
- Position: sticky (top: 0)
- Z-index: 10

**Header Cells:**
- Padding: 12px 16px
- Font size: 11px (--text-label-size)
- Font weight: 600
- Text transform: uppercase
- Letter spacing: 0.05em
- Color: --color-neutral-700
- Border right: 1px solid --color-border-grid

**First Column (Metric Name):**
- Width: 200px
- Position: sticky (left: 0)
- Background: white
- Z-index: 5
- Contains two lines:
  - Line 1: Metric name (font-size: 14px, font-weight: 600, color: --color-neutral-900)
  - Line 2: Data source (font-size: 12px, color: --color-neutral-500)

**Second Column (Data Source):**
- Width: 150px
- Display: Data source name
- Font size: 13px
- Color: --color-neutral-600

**Month Columns:**
- Width: 100px each
- Text align: center
- Header shows abbreviated month (Jan, Feb, etc.)

**Data Cells:**
- Padding: 12px 16px
- Border right: 1px solid --color-border-grid
- Border bottom: 1px solid --color-border-grid
- Font family: --font-mono (for tabular numbers)
- Font size: 14px
- Text align: right
- Color: --color-neutral-700
- Transition: background 200ms

**Cell Hover State:**
- Background: --color-neutral-50
- Cursor: pointer

**Cell Edit State:**
- Border: 2px solid --color-primary-600
- Box shadow: 0 0 0 3px rgba(99, 102, 241, 0.1)
- Background: white
- Display: input field

**Empty Cells:**
- Display: placeholder "—" or empty
- Color: --color-neutral-300

### Sample Data Structure

```typescript
interface Metric {
  id: string;
  name: string;
  dataSource: string;
  values: {
    [month: string]: number | null; // "2024-01": 1234
  };
}

const exampleMetrics: Metric[] = [
  {
    id: "1",
    name: "Sales",
    dataSource: "Xero",
    values: {
      "2024-01": null,
      "2024-02": null,
      // ... other months
    }
  },
  {
    id: "2",
    name: "Website Visits",
    dataSource: "Google Analytics",
    values: {
      "2024-01": 15234,
      "2024-02": 16789,
      // ... other months
    }
  },
  {
    id: "3",
    name: "Instagram Followers",
    dataSource: "Instagram Insights",
    values: {
      "2024-01": 5420,
      "2024-02": 5678,
      // ... other months
    }
  }
];
```

### Interaction Patterns

**Click on Metric Name:**
- Navigate to Metric Detail Page
- Pass metric ID as route parameter
- Transition: fade or slide

**Click on Data Cell:**
- Convert cell to input field
- Auto-focus input
- Select existing value if present
- Allow numeric input only
- On Enter: Save value and move to next cell (right)
- On Tab: Save and move to next cell (right)
- On Shift+Tab: Save and move to previous cell (left)
- On Escape: Cancel edit and revert
- On Blur: Save value

**Add Metric Button:**
- Open modal dialog
- Modal contains:
  - Title: "Add New Metric"
  - Input: Metric name (required)
  - Dropdown: Data source (required)
  - Buttons: Cancel (secondary), Add Metric (primary)

---

## Page 2: Metric Detail Page

### Layout Structure

The Metric Detail page shows year-over-year comparison for a single metric with a data table, trend chart, and AI insights panel.

**Page Hierarchy:**

```
<Page>
  <Header>
    <BackButton />
    <Title>{metricName}</Title>
    <Toggle label="Year to date" />
  </Header>
  <MainContent>
    <LeftColumn>
      <YearComparisonTable />
      <TrendChart />
    </LeftColumn>
    <RightColumn>
      <AIInsightsPanel />
    </RightColumn>
  </MainContent>
</Page>
```

### Header Specifications

**Back Button:**
- Position: Top-left
- Icon: Left arrow
- Size: 24x24px
- Color: --color-neutral-600
- Hover: --color-neutral-900
- Click: Navigate back to Scoreboard page

**Title:**
- Text: "Scoreboard" (page title)
- Font size: 36px
- Font weight: 700
- Color: --color-neutral-900
- Position: Center-left after back button

**Year to Date Toggle:**
- Position: Top-right
- Label: "Year to date"
- Toggle switch component
- Default: Off
- When on: Show YTD column in table and adjust chart

### Year Comparison Table

**Container:**
- Background: white
- Border: 1px solid --color-border-default
- Border radius: 12px
- Box shadow: --shadow-sm
- Margin bottom: 24px

**Table Structure:**
- Rows: Months (Jan through Dec, plus YTD if toggle is on)
- Columns: Years (2023, 2024, 2025)
- First column: Month names (sticky)

**Header Row:**
- Background: --color-neutral-50
- Border bottom: 1px solid --color-border-default
- Cells show year numbers
- Font size: 14px
- Font weight: 600
- Text align: center

**Month Column (First Column):**
- Width: 120px
- Position: sticky (left: 0)
- Background: white
- Font size: 13px
- Font weight: 600
- Color: --color-neutral-700
- Padding: 12px 16px

**Data Cells:**
- Padding: 12px 16px
- Font family: --font-mono
- Font size: 14px
- Text align: right
- Color: --color-neutral-700
- Border right: 1px solid --color-border-grid
- Border bottom: 1px solid --color-border-grid

**YTD Row (if enabled):**
- Background: --color-neutral-50
- Font weight: 600
- Border top: 2px solid --color-border-strong
- Shows cumulative total for each year

### Trend Chart

**Container:**
- Background: white
- Border: 1px solid --color-border-default
- Border radius: 12px
- Box shadow: --shadow-sm
- Padding: 24px
- Height: 400px

**Chart Type:**
- Line chart with multiple series (one per year)
- X-axis: Months (Jan through Dec)
- Y-axis: Metric values (auto-scaled)

**Chart Styling:**
- Grid lines: --color-border-grid (horizontal only)
- Line colors:
  - 2023: --color-neutral-400
  - 2024: --color-primary-600
  - 2025: --color-info-500
- Line width: 2px
- Point markers: 6px circles
- Point hover: 8px with shadow

**Legend:**
- Position: Bottom of chart
- Display: Horizontal list
- Each item: Color swatch + year label
- Font size: 13px
- Gap: 16px between items

**Axes:**
- X-axis labels: Month abbreviations
- Y-axis labels: Formatted numbers (e.g., "10K", "20K")
- Font size: 12px
- Color: --color-neutral-500

### AI Insights Panel

**Container:**
- Background: white
- Border: 1px solid --color-border-default
- Border radius: 12px
- Box shadow: --shadow-sm
- Padding: 24px
- Position: Right sidebar
- Width: 320px
- Sticky: top: 24px

**Header:**
- Text: "AI Insight"
- Font size: 20px
- Font weight: 600
- Color: --color-neutral-900
- Margin bottom: 16px

**Content:**
- Display: List of insights
- Each insight: Paragraph or bullet point
- Font size: 14px
- Line height: 1.6
- Color: --color-neutral-700

**Insight Types:**
- Trend summary (e.g., "Website visits increased 23% year-over-year")
- Peak identification (e.g., "Highest traffic in March 2024")
- Anomaly detection (e.g., "Unusual drop in July")
- Recommendations (e.g., "Consider seasonal campaigns")

**Styling:**
- Key metrics highlighted in **bold**
- Positive trends: --color-success-600
- Negative trends: --color-error-600
- Neutral: --color-neutral-700

### Sample Data Structure

```typescript
interface MetricDetail {
  id: string;
  name: string;
  dataSource: string;
  yearlyData: {
    [year: string]: {
      [month: string]: number | null;
    };
  };
  insights: AIInsight[];
}

interface AIInsight {
  id: string;
  type: 'trend' | 'peak' | 'anomaly' | 'recommendation';
  text: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

const exampleMetricDetail: MetricDetail = {
  id: "2",
  name: "Website Visits",
  dataSource: "Google Analytics",
  yearlyData: {
    "2023": {
      "01": 12500,
      "02": 13200,
      // ... other months
    },
    "2024": {
      "01": 15234,
      "02": 16789,
      // ... other months
    },
    "2025": {
      "01": null,
      "02": null,
      // ... future months
    }
  },
  insights: [
    {
      id: "1",
      type: "trend",
      text: "Website visits increased 23% year-over-year from 2023 to 2024.",
      sentiment: "positive"
    },
    {
      id: "2",
      type: "peak",
      text: "Highest traffic recorded in March 2024 with 18,456 visits.",
      sentiment: "neutral"
    },
    {
      id: "3",
      type: "recommendation",
      text: "Consider launching seasonal campaigns in Q1 to capitalize on traffic trends.",
      sentiment: "neutral"
    }
  ]
};
```

### Responsive Behavior

**Desktop (1440px+):**
- Two-column layout (chart left, insights right)
- Full table width with all columns visible

**Tablet (768px - 1439px):**
- Stack insights panel below chart
- Table horizontal scroll if needed

**Mobile (<768px):**
- Single column layout
- Table horizontal scroll
- Reduced padding and font sizes
- Sticky first column for table

---

## Component Library

### Button Component

```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'text';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
}

// Usage
<Button variant="primary" onClick={handleAddMetric}>
  Add Metric
</Button>
```

**Styles:**
- Primary: Gradient background, white text, shadow
- Secondary: White background, border, neutral text
- Text: Transparent background, primary color text

### Input Component

```typescript
interface InputProps {
  type: 'text' | 'number';
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

// Usage
<Input 
  type="number" 
  value={cellValue} 
  onChange={handleCellChange}
  placeholder="Enter value"
/>
```

### Dropdown Component

```typescript
interface DropdownProps {
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// Usage
<Dropdown
  options={dataSources}
  value={selectedSource}
  onChange={setSelectedSource}
  placeholder="Select data source"
/>
```

### Toggle Component

```typescript
interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

// Usage
<Toggle 
  checked={showYTD} 
  onChange={setShowYTD}
  label="Year to date"
/>
```

### Modal Component

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

// Usage
<Modal
  isOpen={isAddMetricOpen}
  onClose={() => setIsAddMetricOpen(false)}
  title="Add New Metric"
  footer={
    <>
      <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
      <Button variant="primary" onClick={handleAdd}>Add Metric</Button>
    </>
  }
>
  <Input label="Metric Name" value={metricName} onChange={setMetricName} />
  <Dropdown label="Data Source" options={sources} value={source} onChange={setSource} />
</Modal>
```

---

## State Management

### Application State

```typescript
interface AppState {
  currentBrand: Brand | null;
  currentYear: number;
  metrics: Metric[];
  selectedMetric: MetricDetail | null;
  showYTD: boolean;
  isAddMetricModalOpen: boolean;
}
```

### Actions

```typescript
// Fetch metrics for current brand and year
async function fetchMetrics(brandId: string, year: number): Promise<Metric[]>

// Update metric value
async function updateMetricValue(
  metricId: string, 
  month: string, 
  value: number
): Promise<void>

// Add new metric
async function addMetric(metric: Omit<Metric, 'id'>): Promise<Metric>

// Fetch metric details
async function fetchMetricDetail(metricId: string): Promise<MetricDetail>

// Generate AI insights
async function generateInsights(metricId: string): Promise<AIInsight[]>
```

---

## Routing

```typescript
// Route structure
const routes = {
  scoreboard: '/',
  metricDetail: '/metric/:id'
};

// Navigation
<Link to="/">Scoreboard</Link>
<Link to={`/metric/${metricId}`}>View Details</Link>
```

---

## Database Schema (Supabase)

### Tables

**brands**
```sql
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**metrics**
```sql
CREATE TABLE metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  data_source TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**metric_values**
```sql
CREATE TABLE metric_values (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_id UUID REFERENCES metrics(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL, -- 1-12
  value DECIMAL(15, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(metric_id, year, month)
);
```

**ai_insights**
```sql
CREATE TABLE ai_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_id UUID REFERENCES metrics(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL, -- 'trend', 'peak', 'anomaly', 'recommendation'
  text TEXT NOT NULL,
  sentiment TEXT, -- 'positive', 'negative', 'neutral'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## API Integration

### Supabase Client Setup

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

### Example Queries

**Fetch metrics for a brand:**
```typescript
const { data: metrics, error } = await supabase
  .from('metrics')
  .select('*')
  .eq('brand_id', brandId);
```

**Fetch metric values for a year:**
```typescript
const { data: values, error } = await supabase
  .from('metric_values')
  .select('*')
  .eq('metric_id', metricId)
  .eq('year', year)
  .order('month');
```

**Update metric value:**
```typescript
const { data, error } = await supabase
  .from('metric_values')
  .upsert({
    metric_id: metricId,
    year: year,
    month: month,
    value: value,
    updated_at: new Date().toISOString()
  });
```

---

## Chart Library Integration

### Recommended: Recharts

```typescript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const chartData = months.map(month => ({
  month,
  '2023': yearlyData['2023']?.[month] || 0,
  '2024': yearlyData['2024']?.[month] || 0,
  '2025': yearlyData['2025']?.[month] || 0,
}));

<LineChart width={800} height={400} data={chartData}>
  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-grid)" />
  <XAxis dataKey="month" stroke="var(--color-neutral-500)" />
  <YAxis stroke="var(--color-neutral-500)" />
  <Tooltip />
  <Legend />
  <Line type="monotone" dataKey="2023" stroke="var(--color-neutral-400)" strokeWidth={2} />
  <Line type="monotone" dataKey="2024" stroke="var(--color-primary-600)" strokeWidth={2} />
  <Line type="monotone" dataKey="2025" stroke="var(--color-info-500)" strokeWidth={2} />
</LineChart>
```

---

## Authentication Flow

### Supabase Auth

```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: email,
  password: password,
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: email,
  password: password,
});

// Get current user
const { data: { user } } = await supabase.auth.getUser();

// Sign out
await supabase.auth.signOut();
```

### Protected Routes

```typescript
// Middleware to check authentication
export async function middleware(req: NextRequest) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session && req.nextUrl.pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  
  return NextResponse.next();
}
```

---

## Accessibility Considerations

**Keyboard Navigation:**
- Tab through all interactive elements
- Enter to activate buttons and links
- Arrow keys for dropdown navigation
- Escape to close modals and cancel edits

**Screen Reader Support:**
- Proper ARIA labels on all inputs
- Table headers with scope attributes
- Button labels describe action
- Error messages announced

**Color Contrast:**
- All text meets WCAG AA standards (4.5:1 for normal text)
- Interactive elements have clear focus indicators
- Don't rely solely on color for information

**Focus Management:**
- Visible focus rings on all interactive elements
- Focus trapped in modals
- Focus returned to trigger element when modal closes

---

## Performance Optimization

**Data Loading:**
- Lazy load metric details only when needed
- Cache metric list in memory
- Debounce cell value updates (500ms)
- Batch API calls where possible

**Rendering:**
- Virtualize table rows if >100 metrics
- Memoize chart components
- Use React.memo for table cells
- Optimize re-renders with proper key props

**Code Splitting:**
- Lazy load chart library
- Separate bundle for metric detail page
- Dynamic imports for modals

---

## Testing Checklist

**Unit Tests:**
- [ ] Button component renders correctly
- [ ] Input validation works
- [ ] Cell edit/save logic functions
- [ ] Data formatting utilities

**Integration Tests:**
- [ ] Add metric flow completes
- [ ] Edit cell updates database
- [ ] Navigate between pages
- [ ] Year selector changes data

**E2E Tests:**
- [ ] User can sign up and log in
- [ ] User can create a brand
- [ ] User can add metrics
- [ ] User can enter data
- [ ] User can view metric details
- [ ] Charts render with correct data

---

## Deployment Checklist

**Environment Variables:**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Build Steps:**
1. Install dependencies: `npm install`
2. Run type check: `npm run type-check`
3. Run tests: `npm test`
4. Build production: `npm run build`
5. Deploy to Vercel/Netlify

**Database Setup:**
1. Create Supabase project
2. Run migration scripts
3. Enable Row Level Security (RLS)
4. Set up auth policies

---

## Summary

This implementation guide provides everything Cursor needs to build the Scoreboards application with pixel-perfect accuracy. The design prioritizes clarity, simplicity, and data readability while maintaining a modern, professional aesthetic inspired by Notion and ClickUp.

**Key Implementation Points:**
- Use CSS custom properties for all design tokens
- Implement sticky headers and columns for data grid
- Use Recharts for consistent chart styling
- Integrate Supabase for authentication and data storage
- Follow accessibility best practices
- Optimize for performance with lazy loading and memoization

The application should feel calm, professional, and effortless to use—helping business owners understand their metrics at a glance without visual clutter or complexity.

