'use client'

import { motion } from "framer-motion";
import { useMemo } from "react";

interface DataPoint {
    month: string;
    policies: number;
    claims: number;
}

interface AnalyticsChartProps {
    data: DataPoint[];
    isSimulated?: boolean;
}

export default function AnalyticsChart({ data, isSimulated }: AnalyticsChartProps) {
    const maxVal = useMemo(() => {
        const vals = data.flatMap(d => [d.policies, d.claims]);
        return Math.max(...vals, 10);
    }, [data]);

    return (
        <div className="w-full flex flex-col gap-6">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50" />
                        <span className="text-xs font-bold text-white/60 tracking-wider">NEW POLICIES</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-indigo-400 shadow-lg shadow-indigo-400/50" />
                        <span className="text-xs font-bold text-white/60 tracking-wider">CLAIMS SUBMITTED</span>
                    </div>
                </div>
                {isSimulated && (
                    <div className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-bold text-white/30 uppercase tracking-widest">
                        Demo Trends
                    </div>
                )}
            </div>

            <div className="relative h-64 w-full flex items-end justify-between gap-4 px-2">
                {/* Horizontal Guide Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-full border-t border-white" />
                    ))}
                </div>

                {data.map((point, i) => (
                    <div key={point.month} className="flex-1 flex flex-col items-center gap-3 h-full justify-end group">
                        <div className="flex items-end gap-1.5 h-full">
                            {/* Policy Bar */}
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: `${(point.policies / maxVal) * 100}%`, opacity: 1 }}
                                transition={{ delay: i * 0.1, duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
                                className="w-4 bg-gradient-to-t from-blue-600 via-blue-500 to-cyan-400 rounded-t-lg relative group-hover:brightness-125 transition-all shadow-lg shadow-blue-500/10"
                            >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-blue-900 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xl pointer-events-none z-10">
                                    {point.policies}
                                </div>
                            </motion.div>

                            {/* Claims Bar */}
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: `${(point.claims / maxVal) * 100}%`, opacity: 1 }}
                                transition={{ delay: i * 0.1 + 0.1, duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
                                className="w-4 bg-gradient-to-t from-indigo-700 via-indigo-500 to-purple-400 rounded-t-lg relative group-hover:brightness-125 transition-all shadow-lg shadow-indigo-500/10"
                            >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-indigo-900 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xl pointer-events-none z-10">
                                    {point.claims}
                                </div>
                            </motion.div>
                        </div>
                        <span className="text-[10px] font-bold text-white/30 tracking-tight group-hover:text-white/80 transition-colors">
                            {point.month.toUpperCase()}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
