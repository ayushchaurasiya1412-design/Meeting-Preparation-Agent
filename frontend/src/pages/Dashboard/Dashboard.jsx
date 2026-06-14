import { useEffect, useState } from "react";
import api from "../../services/api";
import StatCard from "../../components/cards/StatCard";
import RecentMeetings from "../../components/tables/RecentMeetings";
import RecentClients from "../../components/tables/RecentClients";
import AIInsights from "../../components/cards/AIInsights";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const MOCK = { clients: 5, meetings: 5, notes: 4, actions: 10 };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "10px 14px", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
      <div style={{ color: "#94a3b8", fontSize: "0.76rem", marginBottom: "4px" }}>{label}</div>
      <div style={{ color: "#7c3aed", fontWeight: 700, fontSize: "1.1rem" }}>{payload[0].value}</div>
    </div>
  );
};

export default function Dashboard() {
  const [stats, setStats] = useState(MOCK);

  useEffect(() => {

  api.get("/api/dashboard/stats")

    .then((res) => {

      setStats({
        clients: res.data.clients,
        meetings: res.data.meetings,
        notes: res.data.notes,
        actions: res.data.actions
      });

    })

    .catch(() => {

      setStats(MOCK);

    });

}, []);

  const barData = [
    { name: "Clients", value: stats.clients },
    { name: "Meetings", value: stats.meetings },
    { name: "Notes", value: stats.notes },
    { name: "Actions", value: stats.actions },
  ];

  const pieData = [
    { name: "Completed", value: Math.max(1, Math.floor(stats.actions * 0.4)) },
    { name: "Pending", value: Math.max(1, Math.ceil(stats.actions * 0.6)) },
  ];
  const PIE_COLORS = ["#10b981", "#7c3aed"];

  const statCards = [
    {
      title: "Total Clients", value: stats.clients, subtitle: `${Math.ceil(stats.clients * 0.6)} active`,
      color: "#7c3aed", gradient: "#f5f3ff",
      icon: <svg width="22" height="22" fill="none" stroke="#7c3aed" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    },
    {
  title: "AI Productivity",
  value: `${Math.min(
    100,
    Math.floor(
      (
        stats.meetings +
        stats.notes +
        stats.actions
      ) * 5
    )
  )}%`,
  subtitle: "AI Efficiency Score",
  color: "#ec4899",
  gradient: "#fdf2f8",

  icon: (
    <svg
      width="22"
      height="22"
      fill="none"
      stroke="#ec4899"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18"
      />
    </svg>
  ),
},
    {
      title: "Meetings", value: stats.meetings, subtitle: `${Math.ceil(stats.meetings * 0.4)} upcoming`,
      color: "#0ea5e9", gradient: "#f0f9ff",
      icon: <svg width="22" height="22" fill="none" stroke="#0ea5e9" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    },
    {
      title: "Notes", value: stats.notes, subtitle: "All time",
      color: "#10b981", gradient: "#ecfdf5",
      icon: <svg width="22" height="22" fill="none" stroke="#10b981" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    },
    {
      title: "Completion Rate", value: `${stats.actions > 0 ? Math.floor((stats.actions * 0.4 / stats.actions) * 100) : 0}%`,
      subtitle: "Meetings completed", color: "#f59e0b", gradient: "#fffbeb",
      icon: <svg width="22" height="22" fill="none" stroke="#f59e0b" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
    },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: 800, color: "#0f172a" }}>Dashboard</h1>
        <p style={{ margin: "6px 0 0", color: "#94a3b8", fontSize: "0.9rem" }}>
          Overview of <span style={{ color: "#7c3aed" }}>your meeting preparation workspace</span>
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        {statCards.map((s) => <StatCard key={s.title} {...s} />)}
      </div>

      {/* AI Summary Banner */}
      <div className="glass" style={{
        padding: "20px 24px", marginBottom: "24px",
        background: "linear-gradient(135deg, #f5f3ff, #ede9fe)",
        border: "1px solid #ddd6fe",
        display: "flex", alignItems: "center", gap: "16px",
      }}>
        <div style={{
          width: "42px", height: "42px", borderRadius: "12px", flexShrink: 0,
          background: "#f5f3ff", display: "grid", placeItems: "center",
          border: "1px solid #ddd6fe",
        }}>
          <svg width="20" height="20" fill="none" stroke="#7c3aed" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H4a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2h-1" />
          </svg>
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "#0f172a" }}>🤖 AI Executive Summary</div>
          <div style={{ fontSize: "0.84rem", color: "#475569", marginTop: "3px" }}>
            Managing <strong style={{ color: "#7c3aed" }}>{stats.clients}</strong> clients · <strong style={{ color: "#0ea5e9" }}>{stats.meetings}</strong> meetings · <strong style={{ color: "#10b981" }}>{stats.notes}</strong> notes · <strong style={{ color: "#f59e0b" }}>{stats.actions}</strong> action items tracked.
          </div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
        <div className="glass" style={{ padding: "24px" }}>
          <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "#0f172a", marginBottom: "20px" }}>📈 System Analytics</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} barSize={28}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="url(#barGrad)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass" style={{ padding: "24px" }}>
          <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "#0f172a", marginBottom: "20px" }}>📊 Action Status</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} innerRadius={44} dataKey="value" nameKey="name" paddingAngle={4}>
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend formatter={v => <span style={{ color: "#475569", fontSize: "0.8rem" }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
        <RecentMeetings />
        <RecentClients />
        <AIInsights />
      </div>
    </div>
  );
}