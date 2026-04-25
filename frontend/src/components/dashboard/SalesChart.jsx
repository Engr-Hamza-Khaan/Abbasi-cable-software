import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
} from 'recharts'


function SalesChart({ transactions = [] }) {
    const totals = transactions.reduce((acc, tx) => {
        acc.cash += Number(tx.cashAmount) || 0;
        acc.online += Number(tx.onlineAmount) || 0;
        acc.credit += Number(tx.creditAmount) || 0;
        return acc;
    }, { cash: 0, online: 0, credit: 0 });

    const totalAll = totals.cash + totals.online + totals.credit;
    
    const data = [
        { name: "Credit", value: totalAll > 0 ? Math.round((totals.credit / totalAll) * 100) : 0, color: '#3b82f6' },
        { name: "Cash", value: totalAll > 0 ? Math.round((totals.cash / totalAll) * 100) : 0, color: '#8b5cf6' },
        { name: "Bank Transfer", value: totalAll > 0 ? Math.round((totals.online / totalAll) * 100) : 0, color: '#10b981' },
        { name: "Other", value: 0, color: '#f59e0b' },
    ].filter(item => item.value > 0 || item.name === "Cash"); // Keep Cash even if 0 to show something if empty

    // If everything is 0, show a default slice
    const chartData = data.reduce((sum, item) => sum + item.value, 0) === 0 
        ? [{ name: "No Data", value: 100, color: '#cbd5e1' }] 
        : data;

    return (
        <div className='bg-white dark:bg-slate-900 backdrop-blur-xl rounded-b-2xl p-6 border
    border-slate-200/50 dark:border-slate-700/50'>
            <div className="mb-6">
                <h3 className='text-lg font-bold text-slate-800 dark:text-white'>
                    Cash Flow Distribution
                </h3>
                <p className='text-sm text-slate-500 dark:text-slate-400'>
                    Distribution of Cash Flows
                </p>
            </div>
            <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <defs>
                            {/* Gradients for each category */}
                            <linearGradient id="creditGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="100%" stopColor="#60a5fa" />
                            </linearGradient>

                            <linearGradient id="cashGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#8b5cf6" />
                                <stop offset="100%" stopColor="#a78bfa" />
                            </linearGradient>

                            <linearGradient id="bankTransferGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#10b981" />
                                <stop offset="100%" stopColor="#34d399" />
                            </linearGradient>

                            <linearGradient id="otherGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#f59e0b" />
                                <stop offset="100%" stopColor="#fbbf24" />
                            </linearGradient>
                        </defs>

                        <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={40}
                            outerRadius={80}
                            paddingAngle={5}
                            cornerRadius={5}
                        >
                            {chartData.map((entry, index) => {
                                const gradientMap = {
                                    "Credit": "creditGradient",
                                    "Cash": "cashGradient",
                                    "Bank Transfer": "bankTransferGradient",
                                    "Other": "otherGradient",
                                    "No Data": "otherGradient"
                                };
                                return (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.name === "No Data" ? "#cbd5e1" : `url(#${gradientMap[entry.name]})`}
                                    />
                                );
                            })}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "rgba(255, 255, 255, 0.95)",
                                border: "none",
                                borderRadius: "12px",
                                boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                            }}
                            formatter={(value, name) => [`${value}%`, name]}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="space-y-3">
                {chartData.map((item, index) => {
                    return <div key={index} className='flex items-center justify-between'>
                        <div className='flex items-center space-x-3'>
                            <div
                              className='w-3 h-3 rounded-full'
                              style={{ backgroundColor: item.color}}
                              />
                            <span className='text-sm  text-slate-600 dark:text-slate-400'>
                                {item.name}
                            </span>
                        </div>
                        <div className='text-sm font-semibold text-slate-800 dark:text-white'>
                            {item.value}%
                        </div>
                    </div>
                })}
            </div>
        </div>
    )
}

export default SalesChart
