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
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.uniqueVisitors}</div>
                        <p className="text-xs text-muted-foreground">Unique sessions tracked</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.totalViews}</div>
                        <p className="text-xs text-muted-foreground">Page/Simulated views</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {data.uniqueVisitors > 0
                                ? (data.totalViews / data.uniqueVisitors).toFixed(1)
                                : 0}
                        </div>
                        <p className="text-xs text-muted-foreground">Avg. views per visitor</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-1">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Popular Exhibits</CardTitle>
                        <CardDescription>
                            Top 5 most viewed stages in this story
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px] w-full min-w-0">
                            {data.popularStages.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.popularStages} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#333" />
                                        <XAxis type="number" stroke="#888888" fontSize={12} />
                                        <YAxis
                                            dataKey="name"
                                            type="category"
                                            width={100}
                                            stroke="#888888"
                                            fontSize={12}
                                            tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#171717', border: '1px solid #333', color: '#fff' }}
                                            cursor={{ fill: '#33333333' }}
                                        />
                                        <Bar dataKey="views" radius={[0, 4, 4, 0]}>
                                            {data.popularStages.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${(index % 5) + 1}))`} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-muted-foreground">
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
