import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

// FIX: Moved COLORS constant to the top-level scope
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
                <p className="label text-sm text-slate-300">{data.name}</p>
                <p className="intro text-white font-bold">{formattedValue}</p>
            </div>
        );
    }
    return null;
};

const CustomLegend = (props) => {
    const { payload } = props;
    return (
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
            {payload.map((entry, index) => (
                <div key={`item-${index}`} className="flex items-center text-sm">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }} />
                    <span className="text-slate-300">{entry.value}</span>
                </div>
            ))}
        </div>
    );
};

const ExpenditureChart = ({ data, total }) => {
    const formatCurrency = (amount) => {
        if (amount >= 1000) {
            return `₹${(amount / 1000).toFixed(1)}K`;
        }
        return `₹${amount}`;
    };
    
    return (
        <div className="bg-slate-800/50 backdrop-blur-3xl border border-white/25 p-6 rounded-3xl shadow-lg h-full flex flex-col">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Tooltip 
                        content={<CustomChartTooltip />} 
                        cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                        isAnimationActive={false} 
                    />
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        innerRadius="85%"
                        outerRadius="100%"
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Legend content={<CustomLegend />} verticalAlign="bottom" />
                </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none mt-[-20px]">
                <p className="text-5xl font-bold text-white">{formatCurrency(total)}</p>
                <p className="text-slate-400">Total Spent</p>
            </div>
        </div>
    );
};

export default ExpenditureChart;