import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SensorChart = () => {
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        fetch('/api/sensors/history?hours=24')
            .then(res => res.json())
            .then(data => {
                // Process Raw Data into Chart Format
                // Raw: [{ grow_id, temperature, humidity, timestamp }, ...]
                // Target: [{ time: '12:00', box1: 25, box2: 26 }, ...]

                const buckets = {};

                data.forEach(row => {
                    if (!row.timestamp || !row.temperature) return;

                    // Round to nearest minute to group sync readings
                    const date = new Date(row.timestamp);
                    date.setSeconds(0, 0);
                    const key = date.getTime(); // Use timestamp as key for sorting

                    if (!buckets[key]) {
                        buckets[key] = {
                            time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            timestamp: key
                        };
                    }

                    if (row.grow_id === 1) buckets[key].box1 = row.temperature;
                    if (row.grow_id === 2) buckets[key].box2 = row.temperature;
                });

                // Convert to array and sort
                const processed = Object.values(buckets).sort((a, b) => a.timestamp - b.timestamp);
                setChartData(processed);
            })
            .catch(err => console.error("Chart data fetch failed", err));
    }, []);

    if (chartData.length === 0) return null;

    return (
        <div className="glass-panel" style={{ padding: '20px', marginTop: '20px', height: '300px' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#e2e8f0', fontSize: '16px' }}>История Температуры (24ч)</h3>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                        dataKey="time"
                        stroke="#94a3b8"
                        fontSize={12}
                        tickMargin={10}
                        minTickGap={30} // Prevent overcrowding
                    />
                    <YAxis
                        stroke="#94a3b8"
                        fontSize={12}
                        domain={['auto', 'auto']} // Auto scale
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                        itemStyle={{ color: '#e2e8f0' }}
                    />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="box1"
                        name="Box #1"
                        stroke="#4ade80"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="box2"
                        name="Box #2"
                        stroke="#f87171"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SensorChart;
