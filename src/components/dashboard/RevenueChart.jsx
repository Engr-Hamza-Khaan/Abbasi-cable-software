import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,

} from 'recharts'

function RevenueChart() {
  const data = [

    { month: "Jan", Revenue: 45000, Expenses: 32000 },
    { month: "Feb", Revenue: 52000, Expenses: 38000 },
    { month: "Mar", Revenue: 48000, Expenses: 35000 },
    { month: "Apr", Revenue: 61000, Expenses: 42000 },
    { month: "May", Revenue: 55000, Expenses: 40000 },
    { month: "Jun", Revenue: 67000, Expenses: 45000 },
    { month: "Jul", Revenue: 72000, Expenses: 48000 },
    { month: "Aug", Revenue: 69000, Expenses: 46000 },
    { month: "Sep", Revenue: 78000, Expenses: 52000 },
    { month: "Oct", Revenue: 74000, Expenses: 50000 },
    { month: "Nov", Revenue: 82000, Expenses: 55000 },
    { month: "Dec", Revenue: 89000, Expenses: 58000 },
  ];

  

  return (
    <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-b-2xl border
    border-slate-200/50 dark:border-slate-700/50 p-6'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h3 className='text-xl font-bold text-slate-800 dark:text-white'>
            Revenue Chart
          </h3>
          <p className='text-sm text-slate-500 dark:text-slate-400'>
            Monthly Revenue And Expenses
          </p>
        </div>
        <div className='flex items-center space-x-4'>
          <div className='flex items-center space-x-2'>
            <div className='w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full'></div>
            <div className='text-sm text-slate-600 dark:text-slate-400'>
              <span> Revenue </span>
            </div>
          </div>
          <div className='flex items-center space-x-2'>
            <div className='w-3 h-3 bg-gradient-to-r from-slate-400 to-slate-500 rounded-full'></div>
            <div className='text-sm text-slate-600 dark:text-slate-400'>
              <span> Expenses </span>
            </div>
          </div>
        </div>
      </div>
      <div className="h-80">
        {" "}
        <ResponsiveContainer width='100%' heigth='100%'>
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 30, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3.3"
              stroke='#e2e8f0'
              opacity={0.3}
            />
            <XAxis
              dataKey='month'
              stroke='#64748b'
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke='#64748b'
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: "none",
                borderRadius: "12px",
                boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
              }}
              formatter={(value, name) => {
                return [`$${value.toLocaleString()}`, name]
              }
              }
            />
            

            <Bar
              dataKey="Revenue"
              fill='url(#revenueGradient)'
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />

            <Bar
              dataKey="Expenses"
              fill='url(#expensesGradient)'
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />

            <defs>
              <linearGradient id='revenueGradient' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='0%' stopColor='#3b82f6' />
                <stop offset='100%' stopColor='#8b5cf6' />
              </linearGradient>
              <linearGradient id='expensesGradient' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='0%' stopColor='#94a3b8' />
                <stop offset='100%' stopColor='#64748b' />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default RevenueChart
