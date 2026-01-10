
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShoppingCart, Activity, MousePointer2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface AnalyticsData {
  today: {
    visitors: number;
    orders: number;
    liveUsers: number;
  };
  monthly: {
    visitors: number;
  };
  trafficOverview: { date: string; visitors: number }[];
  trafficSources: { name: string; value: number }[];
  topPages: { page: string; views: number; uniqueVisitors: number; avgTime: number }[];
  topLocations: { city: string; country: string; percentage: number }[];
}

const COLORS = ['#2563eb', '#3b82f6', '#1e40af', '#F59E0B', '#10B981'];

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch analytics", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading Analytics...</div>;
  }

  if (!data) return <div>Failed to load data.</div>;

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
      </div>

      {/* Top Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.today.visitors.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+5.2% from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.monthly.visitors.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.today.orders}</div>
            <p className="text-xs text-muted-foreground">+8.5% from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Live Users</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              {data.today.liveUsers}
            </div>
            <p className="text-xs text-muted-foreground">Users currently on site</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Traffic Overview</CardTitle>
            <p className="text-sm text-muted-foreground">Visitors for the last 30 days.</p>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.trafficOverview}>
                  <defs>
                    <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#eab3a3" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#eab3a3" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    interval={4}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#fdf8f6", borderColor: "#fecaca" }}
                    itemStyle={{ color: "#881337" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="visitors"
                    stroke="#e17a5f"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorVisitors)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
            <p className="text-sm text-muted-foreground">Where your visitors are coming from.</p>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.trafficSources}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.trafficSources.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend iconType="circle" layout="horizontal" verticalAlign="bottom" align="center" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-4 md:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Most Visited Pages</CardTitle>
            <p className="text-sm text-muted-foreground">Your most popular pages by views.</p>
          </CardHeader>
          <CardContent>
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm text-left">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Page</th>
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Views</th>
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Unique Visitors</th>
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Avg. Time</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {data.topPages.map((page) => (
                    <tr key={page.page} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-4 align-middle font-medium flex items-center gap-2">
                        {page.page}
                        <MousePointer2 className="h-3 w-3 text-muted-foreground opacity-50" />
                      </td>
                      <td className="p-4 align-middle text-right">{page.views.toLocaleString()}</td>
                      <td className="p-4 align-middle text-right">{page.uniqueVisitors.toLocaleString()}</td>
                      <td className="p-4 align-middle text-right">{Math.floor(page.avgTime / 60)}m {Math.floor(page.avgTime % 60)}s</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Top Locations</CardTitle>
            <p className="text-sm text-muted-foreground">Visitor distribution by city.</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topLocations.map((loc) => (
                <div key={loc.city} className="flex items-center">
                  <div className="w-[60px] text-sm text-muted-foreground font-medium">{loc.country}</div>
                  <div className="flex-1 text-sm font-medium">{loc.city}</div>
                  <div className="text-sm font-bold text-muted-foreground bg-secondary px-2 py-1 rounded-full">{loc.percentage}%</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
