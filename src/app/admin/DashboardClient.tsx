"use client";

import React from "react";
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

const COLORS = ["#A78BFA", "#F472B6", "#C084FC", "#F59E0B"];

export default function DashboardClient({
  metrics,
  recentActivity,
  revenueChartData,
  bookingsChartData,
  bagColorData,
  stylePrefData,
}: Props) {
  // If no chart data, display mock placeholders for layout testing
  const finalRevData =
    revenueChartData.length > 0
      ? revenueChartData
      : [
          { name: "May", revenue: 45000 },
          { name: "Jun", revenue: 58000 },
          { name: "Jul", revenue: 84000 },
        ];

  const finalBookingData =
    bookingsChartData.length > 0
      ? bookingsChartData
      : [
          { date: "06/01", seats: 3 },
          { date: "06/05", seats: 5 },
          { date: "06/08", seats: 8 },
        ];

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-serif text-3xl text-white font-light">Atelier Analytics</h1>
          <p className="text-xs font-light text-soft-brown mt-1">
            Real-time workshop bookings and revenue overview.
          </p>
        </div>
      </div>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-sand/40 border border-mocha/10 rounded-2xl p-6 shadow-md">
          <div className="text-[10px] tracking-widest text-mocha uppercase font-light mb-2">
            Total Revenue
          </div>
          <div className="font-serif text-3xl text-white">
            ₹{metrics.totalRevenue.toLocaleString()}
          </div>
          <p className="text-[9px] text-soft-brown mt-2">
            Pending checkout amount: ₹{metrics.pendingRevenue.toLocaleString()}
          </p>
        </div>

        {/* Confirmed Bookings */}
        <div className="bg-sand/40 border border-mocha/10 rounded-2xl p-6 shadow-md">
          <div className="text-[10px] tracking-widest text-mocha uppercase font-light mb-2">
            Confirmed Bookings
          </div>
          <div className="font-serif text-3xl text-white">{metrics.bookingsCount}</div>
          <p className="text-[9px] text-soft-brown mt-2">Reservations checked in: Active</p>
        </div>

        {/* Unique Customers */}
        <div className="bg-sand/40 border border-mocha/10 rounded-2xl p-6 shadow-md">
          <div className="text-[10px] tracking-widest text-mocha uppercase font-light mb-2">
            Unique Customers
          </div>
          <div className="font-serif text-3xl text-white">{metrics.customersCount}</div>
          <p className="text-[9px] text-soft-brown mt-2">Customer contacts collected</p>
        </div>

        {/* Available Seats */}
        <div className="bg-sand/40 border border-mocha/10 rounded-2xl p-6 shadow-md">
          <div className="text-[10px] tracking-widest text-mocha uppercase font-light mb-2">
            Available Seats
          </div>
          <div className="font-serif text-3xl text-warm-brown">{metrics.availableSeats}</div>
          <p className="text-[9px] text-soft-brown mt-2">
            Scheduled across {metrics.upcomingWorkshops} upcoming date(s)
          </p>
        </div>
      </div>

      {/* GRAPHS AND CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Growth Graph */}
        <div className="bg-sand/30 border border-mocha/10 rounded-2xl p-6 shadow-md">
          <h3 className="font-serif text-lg text-white mb-6">Revenue Growth</h3>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={finalRevData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A78BFA" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#A78BFA" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(167,139,250,0.1)" />
                <XAxis dataKey="name" stroke="#C084FC" style={{ fontSize: 10 }} />
                <YAxis stroke="#C084FC" style={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ background: "#1B112A", border: "0.5px solid rgba(167,139,250,0.3)", borderRadius: 10, color: "white" }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#A78BFA" fillOpacity={1} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bookings Graph */}
        <div className="bg-sand/30 border border-mocha/10 rounded-2xl p-6 shadow-md">
          <h3 className="font-serif text-lg text-white mb-6">Seats Reserved</h3>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={finalBookingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(167,139,250,0.1)" />
                <XAxis dataKey="date" stroke="#C084FC" style={{ fontSize: 10 }} />
                <YAxis stroke="#C084FC" style={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ background: "#1B112A", border: "0.5px solid rgba(167,139,250,0.3)", borderRadius: 10, color: "white" }}
                />
                <Bar dataKey="seats" fill="#F472B6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* PIE CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Style Preferences */}
        <div className="bg-sand/30 border border-mocha/10 rounded-2xl p-6 shadow-md flex flex-col justify-between">
          <h3 className="font-serif text-lg text-white mb-6">Medium Preferences</h3>
          <div className="h-[240px] w-full flex items-center justify-center">
            {stylePrefData.reduce((a, b) => a + b.value, 0) === 0 ? (
              <p className="text-xs text-soft-brown font-light">No preferences recorded yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stylePrefData.filter((d) => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stylePrefData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "#1B112A", border: "0.5px solid rgba(167,139,250,0.3)", borderRadius: 10, color: "white" }}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Color Preferences */}
        <div className="bg-sand/30 border border-mocha/10 rounded-2xl p-6 shadow-md flex flex-col justify-between">
          <h3 className="font-serif text-lg text-white mb-6">Tote Color Preferences</h3>
          <div className="h-[240px] w-full flex items-center justify-center">
            {bagColorData.reduce((a, b) => a + b.value, 0) === 0 ? (
              <p className="text-xs text-soft-brown font-light">No preferences recorded yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bagColorData.filter((d) => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {bagColorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "#1B112A", border: "0.5px solid rgba(167,139,250,0.3)", borderRadius: 10, color: "white" }}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* RECENT BOOKINGS TABLE */}
      <div className="bg-sand/30 border border-mocha/10 rounded-2xl p-6 shadow-md">
        <h3 className="font-serif text-lg text-white mb-6">Recent Atelier Activity</h3>
        {recentActivity.length === 0 ? (
          <p className="text-xs text-soft-brown font-light text-center py-6">
            No booking activities recorded.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-mocha/15 text-[10px] tracking-wider text-mocha uppercase">
                  <th className="py-3 px-4 font-light">Booking ID</th>
                  <th className="py-3 px-4 font-light">Customer</th>
                  <th className="py-3 px-4 font-light">Seats</th>
                  <th className="py-3 px-4 font-light">Date</th>
                  <th className="py-3 px-4 font-light">Amount</th>
                  <th className="py-3 px-4 font-light">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mocha/5 font-light text-soft-brown">
                {recentActivity.map((act) => (
                  <tr key={act.id} className="hover:bg-sand/20 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-white">{act.ref}</td>
                    <td className="py-3.5 px-4">{act.customerName}</td>
                    <td className="py-3.5 px-4">{act.participants}</td>
                    <td className="py-3.5 px-4">{act.dateStr}</td>
                    <td className="py-3.5 px-4 text-white">₹{act.amount.toLocaleString()}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[9px] uppercase tracking-wider py-1 px-3 rounded-full ${
                          act.status === "CONFIRMED"
                            ? "bg-green-400/10 text-green-400 border border-green-400/30"
                            : "bg-red-400/10 text-red-400 border border-red-400/30"
                        }`}
                      >
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
