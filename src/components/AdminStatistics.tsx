import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";
import { Athlete } from "../types";

interface AdminStatisticsProps {
  athletes: Athlete[];
}

export default function AdminStatistics({ athletes }: AdminStatisticsProps) {
  const chartData = useMemo(() => {
    const categoryStats = athletes.reduce((acc: any, athlete) => {
      const cat = athlete.kategori || 'Lainnya';
      if (!acc[cat]) acc[cat] = { name: cat, Putra: 0, Putri: 0, Total: 0 };
      if (athlete.jk === 'Putra') acc[cat].Putra++;
      if (athlete.jk === 'Putri') acc[cat].Putri++;
      acc[cat].Total++;
      return acc;
    }, {});
    return Object.values(categoryStats).sort((a: any, b: any) => b.Total - a.Total);
  }, [athletes]);

  const genderData = useMemo(() => {
    return [
      { name: 'Putra', value: athletes.filter(a => a.jk === 'Putra').length, color: '#3b82f6' },
      { name: 'Putri', value: athletes.filter(a => a.jk === 'Putri').length, color: '#ec4899' }
    ];
  }, [athletes]);

  const contingentStats = useMemo(() => {
    const counts = athletes.reduce((acc: any, athlete) => {
      const kontingen = athlete.kontingen || 'Tanpa Kontingen';
      if (!acc[kontingen]) acc[kontingen] = 0;
      acc[kontingen]++;
      return acc;
    }, {});
    
    return Object.keys(counts).map(key => ({
      name: key,
      value: counts[key]
    })).sort((a, b) => b.value - a.value);
  }, [athletes]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Statistik & Distribusi</h2>
          <p className="text-sm font-semibold text-slate-500 mt-1">
            Data Analitik Persebaran Kategori, Gender dan Kontingen
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Distribusi Kategori
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="Putra" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
                <Bar dataKey="Putri" stackId="a" fill="#ec4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col">
          <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-fuchsia-500"></span> Komposisi Gender
          </h3>
          <div className="flex-1 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-2">
            {genderData.map(g => (
              <div key={g.name} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: g.color }}></span>
                <span className="text-xs font-bold text-slate-600">{g.name} ({g.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider mb-6 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Distribusi Kontingen (Teratas)
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={contingentStats.slice(0, 15)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} tickLine={false} axisLine={false} />
              <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
