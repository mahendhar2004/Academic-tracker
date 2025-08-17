import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00c49f', '#ffbb28'];

const CustomChartTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0];
        const formattedValue = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(data.value);
        return (
            <div 
                className="bg-slate-900/80 backdrop-blur-md border border-white/20 p-3 rounded-lg shadow-lg"
                style={{ transition: 'opacity 0.2s ease-in-out' }}
            >
                <p className="label text-sm text-slate-300">{data.payload.name}</p>
                <p className="intro text-white font-bold">{formattedValue}</p>
            </div>
        );
    }
    return null;
};

const RoundedBar = (props) => {
    const { fill, x, y, width, height } = props;
    return <rect x={x} y={y} width={width} height={height} rx={4} ry={4} fill={fill} />;
};

const MiniExpenditureBarChart = ({ data }) => {
    return (
        <div className="w-full h-48">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    layout="vertical"
                    // FIX: Adjusted margins for better fit
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                    <XAxis type="number" hide />
                    <YAxis 
                        type="category" 
                        dataKey="name" 
                        stroke="#94a3b8" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false}
                        width={100} 
                        tick={{ transform: 'translate(-10, 0)' }}
                    />
                    <Tooltip 
                        cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                        content={<CustomChartTooltip />} 
                        isAnimationActive={false}
                    />
                    <Bar dataKey="value" barSize={12} shape={<RoundedBar />}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default MiniExpenditureBarChart;