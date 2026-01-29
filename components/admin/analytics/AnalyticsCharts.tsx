'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Users, Eye, Trophy } from 'lucide-react'

interface AnalyticsData {
    totalViews: number
    uniqueVisitors: number
    popularStages: {
        name: string
        views: number
        id: string
    }[]
}

export function AnalyticsCharts({ data }: { data: AnalyticsData }) {
    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                {[
                    { title: "Total Visitors", icon: Users, value: data.uniqueVisitors, sub: "Unique sessions tracked" },
                    { title: "Total Views", icon: Eye, value: data.totalViews, sub: "Page/Simulated views" },
                    {
                        title: "Engagement Rate",
                        icon: Trophy,
                        value: data.uniqueVisitors > 0 ? (data.totalViews / data.uniqueVisitors).toFixed(1) : 0,
                        sub: "Avg. views per visitor"
                    }
                ].map((item, i) => (
                    <Card key={i} className="bg-neutral-900/50 border-neutral-800 backdrop-blur-sm text-white hover:bg-neutral-900/80 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-neutral-400">{item.title}</CardTitle>
                            <item.icon className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{item.value}</div>
                            <p className="text-xs text-neutral-500">{item.sub}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-1">
                <Card className="col-span-1 bg-neutral-900/50 border-neutral-800 text-white backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Popular Exhibits</CardTitle>
                        <CardDescription className="text-neutral-400">
                            Top 5 most viewed stages in this story
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px] w-full min-w-0">
                            {data.popularStages.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.popularStages} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                        <defs>
                                            <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                                                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#333" opacity={0.4} />
                                        <XAxis type="number" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis
                                            dataKey="name"
                                            type="category"
                                            width={120}
                                            stroke="#888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="bg-black/90 border border-neutral-800 p-3 rounded-lg backdrop-blur-md shadow-xl">
                                                            <p className="text-sm font-medium text-white mb-1">
                                                                {payload[0].payload.name}
                                                            </p>
                                                            <p className="text-sm text-blue-400">
                                                                Views: <span className="font-bold text-white ml-1">{payload[0].value}</span>
                                                            </p>
                                                        </div>
                                                    )
                                                }
                                                return null
                                            }}
                                        />
                                        <Bar dataKey="views" fill="url(#barGradient)" radius={[0, 4, 4, 0]} barSize={32} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-muted-foreground bg-neutral-900/20 rounded-lg border border-neutral-800/50 border-dashed">
                                    No data available
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
