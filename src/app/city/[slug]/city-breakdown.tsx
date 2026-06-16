"use client";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export function CityBreakdown({ data }: { data: Array<{ name: string; value: number; color: string }> }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={3} strokeWidth={2}>
          {data.map((d, i) => <Cell key={i} fill={d.color} stroke="hsl(var(--background))" />)}
        </Pie>
        <Tooltip
          contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}
          formatter={(v: number) => `${v}%`}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
