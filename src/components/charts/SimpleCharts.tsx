import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export const CHART = {
  grid: '#e8eaed',
  text: '#5f6368',
  ink: '#1a1a1a',
  blue: '#2563eb',
  orange: '#ea580c',
  green: '#16a34a',
  muted: '#94a3b8',
} as const

const tooltipStyle = {
  background: '#fff',
  border: '1px solid #e8eaed',
  borderRadius: 8,
  fontSize: 13,
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
}

interface ChartCardProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  className?: string
}

export function ChartCard({ title, subtitle, children, className = '' }: ChartCardProps) {
  return (
    <div className={`rounded-xl border border-border bg-white p-5 sm:p-6 ${className}`}>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      {subtitle && <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>}
      <div className="mt-5">{children}</div>
    </div>
  )
}

interface FertilityBarChartProps {
  data: Array<{ name: string; tfr: number; displayTfr: number; belowReplacement: boolean }>
}

export function FertilityBarChart({ data }: FertilityBarChartProps) {
  return (
    <div className="h-[420px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ left: 4, right: 48, top: 8, bottom: 8 }}
          barCategoryGap="20%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 2.5]}
            ticks={[0, 0.5, 1, 1.5, 2, 2.1, 2.5]}
            tick={{ fill: CHART.text, fontSize: 12 }}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={76}
            tick={{ fill: CHART.ink, fontSize: 13, fontWeight: 500 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(_v, _n, item) => {
              const tfr = (item?.payload as { tfr?: number })?.tfr
              return [typeof tfr === 'number' ? tfr.toFixed(2) : '—', 'Children per woman']
            }}
          />
          <ReferenceLine
            x={2.1}
            stroke={CHART.orange}
            strokeDasharray="4 4"
            label={{ value: 'Replacement 2.1', fill: CHART.orange, fontSize: 11, position: 'insideTopRight' }}
          />
          <Bar dataKey="displayTfr" radius={[0, 6, 6, 0]} maxBarSize={24} isAnimationActive={false}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.belowReplacement ? CHART.orange : CHART.green} />
            ))}
            <LabelList
              dataKey="tfr"
              position="right"
              formatter={(v) => (typeof v === 'number' ? v.toFixed(2) : String(v))}
              style={{ fill: CHART.ink, fontSize: 12, fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

interface PolicyCompareChartProps {
  data: Array<{
    country: string
    restrictive: number
    expansion: number
  }>
}

export function PolicyCompareChart({ data }: PolicyCompareChartProps) {
  return (
    <div className="h-[360px] w-full sm:h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 48 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
          <XAxis
            dataKey="country"
            tick={{ fill: CHART.text, fontSize: 11 }}
            tickLine={false}
            interval={0}
            angle={-40}
            textAnchor="end"
            height={56}
          />
          <YAxis
            tick={{ fill: CHART.text, fontSize: 12 }}
            tickLine={false}
            tickFormatter={(v: number) => `${v}%`}
            label={{ value: 'Population change by 2076', angle: -90, position: 'insideLeft', fill: CHART.text, fontSize: 11 }}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(v, name) => {
              const num = typeof v === 'number' ? v : 0
              const label = name === 'restrictive' ? 'Restrictive policy' : 'More immigration'
              return [`${num >= 0 ? '+' : ''}${num.toFixed(1)}%`, label]
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12 }}
            formatter={(value: string) => (value === 'restrictive' ? 'Restrictive policy' : 'More immigration')}
          />
          <Bar dataKey="restrictive" fill={CHART.orange} radius={[4, 4, 0, 0]} maxBarSize={28} />
          <Bar dataKey="expansion" fill={CHART.blue} radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

interface CountryPopulationChartProps {
  data: Array<{
    name: string
    statusQuoM: number
    restrictiveM: number
    expansionM: number
  }>
}

export function CountryPopulationChart({ data }: CountryPopulationChartProps) {
  return (
    <div className="h-[480px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ left: 4, right: 16, top: 8, bottom: 8 }}
          barCategoryGap="18%"
          barGap={2}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: CHART.text, fontSize: 12 }}
            tickFormatter={(v: number) => `${v}M`}
            label={{ value: 'Population in 2046 (millions)', position: 'insideBottom', offset: -4, fill: CHART.text, fontSize: 11 }}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={76}
            tick={{ fill: CHART.ink, fontSize: 13, fontWeight: 500 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(v, name) => {
              const num = typeof v === 'number' ? v : 0
              const label =
                name === 'statusQuoM'
                  ? 'Current policy'
                  : name === 'restrictiveM'
                    ? 'Restrictive policy'
                    : 'More immigration'
              return [`${num}M`, label]
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12 }}
            formatter={(value: string) =>
              value === 'statusQuoM'
                ? 'Current policy'
                : value === 'restrictiveM'
                  ? 'Restrictive policy'
                  : 'More immigration'
            }
          />
          <Bar dataKey="statusQuoM" fill={CHART.muted} radius={[0, 4, 4, 0]} maxBarSize={10} />
          <Bar dataKey="restrictiveM" fill={CHART.orange} radius={[0, 4, 4, 0]} maxBarSize={10} />
          <Bar dataKey="expansionM" fill={CHART.blue} radius={[0, 4, 4, 0]} maxBarSize={10} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

interface SimpleLineChartProps {
  data: Array<Record<string, number | string>>
  xKey: string
  lines: Array<{ key: string; label: string; color: string }>
  yLabel: string
  formatY?: (v: number) => string
  height?: number
}

export function SimpleLineChart({
  data,
  xKey,
  lines,
  yLabel,
  formatY = (v) => String(v),
  height = 280,
}: SimpleLineChartProps) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
          <XAxis dataKey={xKey} tick={{ fill: CHART.text, fontSize: 12 }} tickLine={false} />
          <YAxis
            tick={{ fill: CHART.text, fontSize: 12 }}
            tickLine={false}
            tickFormatter={formatY}
            label={{ value: yLabel, angle: -90, position: 'insideLeft', fill: CHART.text, fontSize: 11 }}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            labelFormatter={(label) => `Year ${label}`}
            formatter={(v, _name, item) => {
              const num = typeof v === 'number' ? v : 0
              const line = lines.find((l) => l.key === item.dataKey)
              return [formatY(num), line?.label ?? '']
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} formatter={(value: string) => lines.find((l) => l.key === value)?.label ?? value} />
          {lines.map((line) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.key}
              stroke={line.color}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

interface StatProps {
  label: string
  value: string
  hint?: string
  trend?: string
  trendUp?: boolean
}

export function Stat({ label, value, hint, trend, trendUp }: StatProps) {
  return (
    <div className="rounded-xl border border-border bg-white p-4">
      <p className="text-sm text-ink-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-ink">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
      {trend && (
        <p className={`mt-1 text-xs font-medium ${trendUp ? 'text-green' : 'text-orange'}`}>
          {trend}
        </p>
      )}
    </div>
  )
}
