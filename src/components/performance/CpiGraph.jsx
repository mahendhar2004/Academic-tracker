import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useStore } from '../../store/useStore';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/90 dark:bg-black/50 backdrop-blur-md border border-slate-200 dark:border-white/20 p-3 rounded-lg shadow-lg">
                <p className="label text-sm text-slate-500 dark:text-slate-300">{`Semester ${label}`}</p>
                <p className="intro text-slate-900 dark:text-white font-bold">{`CPI : ${payload[0].value}`}</p>
            </div>
        );
    }
    return null;
};

const CpiGraph = ({ data }) => {
    // Access theme
    const { theme } = useStore();
    const isDark = theme !== 'light';

    return (
        <div className="bg-white/60 dark:bg-gradient-to-br dark:from-white/15 dark:to-white/0 dark:bg-white/10 saturate-150 backdrop-blur-2xl border border-slate-200 dark:border-white/25 p-6 rounded-xl shadow-xl dark:shadow-lg h-[400px] flex flex-col">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">CPI Progress</h3>
            <div className="flex-grow">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={data}
                        margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"} />
                        <XAxis dataKey="semester" stroke={isDark ? "#94a3b8" : "#64748b"} />
                        <YAxis domain={['dataMin - 0.5', 'dataMax + 0.5']} stroke={isDark ? "#94a3b8" : "#64748b"} />
                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ stroke: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0,0,0,0.1)', strokeWidth: 1 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="cpi"
                            stroke={isDark ? "#22d3ee" : "#0891b2"} // cyan-400 : cyan-600
                            strokeWidth={3}
                            dot={{ r: 4, fill: isDark ? '#22d3ee' : '#0891b2' }}
                            activeDot={{ r: 8 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default CpiGraph;
