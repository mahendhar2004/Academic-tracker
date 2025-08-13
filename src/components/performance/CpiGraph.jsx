import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-black/50 backdrop-blur-md border border-white/20 p-3 rounded-lg">
                <p className="label text-sm text-slate-300">{`Semester ${label}`}</p>
                <p className="intro text-white font-bold">{`CPI : ${payload[0].value}`}</p>
            </div>
        );
    }
    return null;
};

const CpiGraph = ({ data }) => {
    return (
        <div className="bg-gradient-to-br from-white/15 to-white/0 bg-white/10 saturate-150 backdrop-blur-2xl border border-white/25 p-6 rounded-xl shadow-lg h-[400px] flex flex-col">
            <h3 className="text-xl font-bold text-white mb-4">CPI Progress</h3>
            <div className="flex-grow">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={data}
                        margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                        <XAxis dataKey="semester" stroke="#94a3b8" />
                        <YAxis domain={['dataMin - 0.5', 'dataMax + 0.5']} stroke="#94a3b8" />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255, 255, 255, 0.2)', strokeWidth: 1 }} />
                        <Line type="monotone" dataKey="cpi" stroke="#22d3ee" strokeWidth={2} dot={{ r: 4, fill: '#22d3ee' }} activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default CpiGraph;
