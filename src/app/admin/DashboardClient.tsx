"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface Metrics {
  totalRevenue: number;
  pendingRevenue: number;
  bookingsCount: number;
  upcomingWorkshops: number;
  availableSeats: number;
  customersCount: number;
}

interface ActivityItem {
  id: string;
  ref: string;
  customerName: string;
  amount: number;
  participants: number;
  dateStr: string;
  status: string;
}

interface ChartItem {
  name: string;
  revenue: number;
}

interface BookingChartItem {
  date: string;
  seats: number;
}

interface PreferencesItem {
  name: string;
  value: number;
}

interface Props {
  metrics: Metrics;
  recentActivity: ActivityItem[];
  revenueChartData: ChartItem[];
  bookingsChartData: BookingChartItem[];
  bagColorData: PreferencesItem[];
  stylePrefData: PreferencesItem[];
}

const CHART_COLORS = ["#B69AC7", "#D9A1B4", "#8A9B84", "#C4A86E"];

// Animated counter hook
function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const ref = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) {
        ref.current = setTimeout(() => requestAnimationFrame(tick), 16);
      }
    };
    requestAnimationFrame(tick);
    return () => { if (ref.current) clearTimeout(ref.current); };
  }, [target, duration]);

  return value;
}

function MetricCard({
  label,
  value,
  prefix = "",
  suffix = "",
  sub,
  accent,
  delay,
  icon,
}: {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  sub?: string;
  accent?: string;
  delay: number;
  icon: React.ReactNode;
}) {
  const [visible, setVisible] = useState(false);
  const count = useCountUp(visible ? value : 0, 1400);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      className="admin-metric-card"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s cubic-bezier(0.34,1.56,0.64,1) ${delay}ms`,
      }}
    >
      <div className="admin-metric-icon" style={{ background: accent || "rgba(182, 154, 199, 0.12)", color: accent ? "var(--ivory)" : "var(--accent)" }}>
        {icon}
      </div>
      <div className="admin-metric-label">{label}</div>
      <div className="admin-metric-value" style={{ color: accent || "var(--dark-mocha)" }}>
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      {sub && <div className="admin-metric-sub">{sub}</div>}
      <div className="admin-metric-glow" style={{ background: accent || "#A78BFA" }} />
    </div>
  );
}

export default function DashboardClient({
  metrics,
  recentActivity,
  revenueChartData,
  bookingsChartData,
  bagColorData,
  stylePrefData,
}: Props) {
  const [chartsVisible, setChartsVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setChartsVisible(true), 600);
    return () => clearTimeout(t);
  }, []);

  const finalRevData =
    revenueChartData.length > 0
      ? revenueChartData
      : [
          { name: "Jan", revenue: 18500 },
          { name: "Feb", revenue: 22000 },
          { name: "Mar", revenue: 31500 },
          { name: "Apr", revenue: 28000 },
          { name: "May", revenue: 41200 },
          { name: "Jun", revenue: 38800 },
        ];

  const finalBookingData =
    bookingsChartData.length > 0
      ? bookingsChartData
      : [
          { date: "Jun 1", seats: 3 },
          { date: "Jun 3", seats: 5 },
          { date: "Jun 5", seats: 2 },
          { date: "Jun 7", seats: 8 },
          { date: "Jun 9", seats: 4 },
          { date: "Jun 10", seats: 6 },
        ];

  const metricCards = [
    {
      label: "Total Revenue",
      value: metrics.totalRevenue,
      prefix: "₹",
      sub: `₹${metrics.pendingRevenue.toLocaleString()} pending`,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
      accent: undefined,
      delay: 100,
    },
    {
      label: "Confirmed Bookings",
      value: metrics.bookingsCount,
      sub: "Total reservations",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 2v4M8 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
          <path d="m9 16 2 2 4-4" />
        </svg>
      ),
      accent: undefined,
      delay: 200,
    },
    {
      label: "Customers",
      value: metrics.customersCount,
      sub: "Unique contacts",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      accent: undefined,
      delay: 300,
    },
    {
      label: "Available Seats",
      value: metrics.availableSeats,
      sub: `Across ${metrics.upcomingWorkshops} upcoming dates`,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      ),
      accent: "#10B981",
      delay: 400,
    },
  ];

  return (
    <div className="admin-dashboard">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Analytics Overview</h1>
          <p className="admin-page-sub">
            Real-time insights for Solviera Atelier workshop bookings
          </p>
        </div>
        <div className="admin-page-badge">
          <span className="admin-live-dot" />
          <span>Live Data</span>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="admin-metrics-grid">
        {metricCards.map((card) => (
          <MetricCard key={card.label} {...card} />
        ))}
      </div>

      {/* CHARTS ROW */}
      <div
        className="admin-charts-grid"
        style={{
          opacity: chartsVisible ? 1 : 0,
          transform: chartsVisible ? "translateY(0)" : "translateY(32px)",
          transition: "opacity 0.7s ease 0.5s, transform 0.7s cubic-bezier(0.34,1.2,0.64,1) 0.5s",
        }}
      >
        {/* Revenue Area Chart */}
        <div className="admin-chart-card">
          <div className="admin-chart-header">
            <div>
              <h3 className="admin-chart-title">Revenue Growth</h3>
              <p className="admin-chart-sub">Monthly earnings trend</p>
            </div>
            <div className="admin-chart-tag">Area Chart</div>
          </div>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={finalRevData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A78BFA" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#A78BFA" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(167,139,250,0.08)" />
                <XAxis dataKey="name" stroke="rgba(167,139,250,0.4)" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis stroke="rgba(167,139,250,0.4)" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} width={45} />
                <Tooltip
                  contentStyle={{ background: "var(--ivory)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
                  itemStyle={{ color: "var(--dark-mocha)" }}
                  labelStyle={{ color: "var(--accent)" }}
                  formatter={(v: number) => [`₹${v.toLocaleString()}`, "Revenue"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#A78BFA" strokeWidth={2} fillOpacity={1} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Seats Bar Chart */}
        <div className="admin-chart-card">
          <div className="admin-chart-header">
            <div>
              <h3 className="admin-chart-title">Seats Reserved</h3>
              <p className="admin-chart-sub">Bookings by date</p>
            </div>
            <div className="admin-chart-tag">Bar Chart</div>
          </div>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={finalBookingData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(167,139,250,0.08)" />
                <XAxis dataKey="date" stroke="rgba(167,139,250,0.4)" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis stroke="rgba(167,139,250,0.4)" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "var(--ivory)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
                  itemStyle={{ color: "var(--dark-mocha)" }}
                  labelStyle={{ color: "var(--accent-pink)" }}
                  formatter={(v: number) => [v, "Seats"]}
                />
                <Bar dataKey="seats" fill="#F472B6" radius={[6, 6, 0, 0]} maxBarSize={40}>
                  {finalBookingData.map((_, i) => (
                    <Cell key={i} fill={`hsl(${320 + i * 5}, 80%, ${65 + i * 2}%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* PIE CHARTS ROW */}
      <div
        className="admin-charts-grid"
        style={{
          opacity: chartsVisible ? 1 : 0,
          transform: chartsVisible ? "translateY(0)" : "translateY(32px)",
          transition: "opacity 0.7s ease 0.8s, transform 0.7s cubic-bezier(0.34,1.2,0.64,1) 0.8s",
        }}
      >
        {/* Style Preferences Donut */}
        <div className="admin-chart-card">
          <div className="admin-chart-header">
            <div>
              <h3 className="admin-chart-title">Booking Type</h3>
              <p className="admin-chart-sub">Guest size preference breakdown</p>
            </div>
            <div className="admin-chart-tag">Donut</div>
          </div>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stylePrefData.filter((d) => d.value > 0)}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {stylePrefData.map((_, index) => (
                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "var(--ivory)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
                  itemStyle={{ color: "var(--dark-mocha)" }}
                  labelStyle={{ color: "var(--accent)" }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  wrapperStyle={{ fontSize: 10, color: "#9CA3AF" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bag Color Donut */}
        <div className="admin-chart-card">
          <div className="admin-chart-header">
            <div>
              <h3 className="admin-chart-title">Tote Colors</h3>
              <p className="admin-chart-sub">Color preference breakdown</p>
            </div>
            <div className="admin-chart-tag">Donut</div>
          </div>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={bagColorData.filter((d) => d.value > 0)}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {bagColorData.map((_, index) => (
                    <Cell key={index} fill={CHART_COLORS[(index + 2) % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "var(--ivory)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
                  itemStyle={{ color: "var(--dark-mocha)" }}
                  labelStyle={{ color: "var(--accent)" }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  wrapperStyle={{ fontSize: 10, color: "#9CA3AF" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITY TABLE */}
      <div
        className="admin-table-card"
        style={{
          opacity: chartsVisible ? 1 : 0,
          transform: chartsVisible ? "translateY(0)" : "translateY(32px)",
          transition: "opacity 0.7s ease 1.1s, transform 0.7s cubic-bezier(0.34,1.2,0.64,1) 1.1s",
        }}
      >
        <div className="admin-chart-header" style={{ marginBottom: "1.5rem" }}>
          <div>
            <h3 className="admin-chart-title">Recent Bookings</h3>
            <p className="admin-chart-sub">Latest atelier activity log</p>
          </div>
          <div className="admin-chart-tag" style={{ color: "#34D399", borderColor: "rgba(52,211,153,0.3)", background: "rgba(52,211,153,0.08)" }}>
            {recentActivity.length} entries
          </div>
        </div>

        {recentActivity.length === 0 ? (
          <div className="admin-empty-state">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ color: "rgba(167,139,250,0.3)", margin: "0 auto 12px" }}>
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M9 21V9" />
            </svg>
            <p>No booking activities yet.</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Booking Ref</th>
                  <th>Customer</th>
                  <th>Seats</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((act, i) => (
                  <tr
                    key={act.id}
                    style={{
                      opacity: chartsVisible ? 1 : 0,
                      transform: chartsVisible ? "translateX(0)" : "translateX(-16px)",
                      transition: `opacity 0.5s ease ${1.2 + i * 0.08}s, transform 0.5s ease ${1.2 + i * 0.08}s`,
                    }}
                  >
                    <td className="admin-table-ref">{act.ref}</td>
                    <td>{act.customerName}</td>
                    <td>
                      <span className="admin-table-badge admin-table-badge--neutral">{act.participants}</span>
                    </td>
                    <td>{act.dateStr}</td>
                    <td className="admin-table-amount">₹{act.amount.toLocaleString()}</td>
                    <td>
                      <span className={`admin-table-badge ${act.status === "CONFIRMED" ? "admin-table-badge--green" : "admin-table-badge--red"}`}>
                        {act.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
