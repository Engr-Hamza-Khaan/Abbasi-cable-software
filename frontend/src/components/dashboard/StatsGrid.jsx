import { Package, AlertTriangle, ShoppingBag, ShoppingCart, ArrowUpRight, ArrowDownRight, Home, Store, Truck } from "lucide-react"

function StatsGrid({ products = [], sales = [], purchases = [], transactions = [], expenses = [] }) {
    const lowStockCount = products.filter(p => p.stock <= p.minStock).length;
    
    // Calculate total income and expense from transactions
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
    const netBalance = totalIncome - totalExpense;

    // Category-wise expenses
    const homeExpenses = expenses.filter(e => e.category === 'home').reduce((sum, e) => sum + Number(e.amount), 0);
    const shopExpenses = expenses.filter(e => e.category === 'shop').reduce((sum, e) => sum + Number(e.amount), 0);
    const transportExpenses = expenses.filter(e => e.category === 'transport').reduce((sum, e) => sum + Number(e.amount), 0);

    const stats = [
    {
        title: "Net Balance",
        value: `Rs. ${netBalance.toLocaleString()}`,
        change: netBalance >= 0 ? "Healthy" : "Low",
        trend: netBalance >= 0 ? "up" : "down",
        icon: ShoppingBag,
        color: "from-blue-500 to-indigo-600",
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
        textColor: "text-blue-600 dark:text-blue-400",
    },
    {
        title: "Home Expenses",
        value: `Rs. ${homeExpenses.toLocaleString()}`,
        change: `${expenses.filter(e => e.category === 'home').length} items`,
        trend: "down",
        icon: Home,
        color: "from-rose-500 to-pink-600",
        bgColor: "bg-rose-50 dark:bg-rose-900/20",
        textColor: "text-rose-600 dark:text-rose-400",
    },
    {
        title: "Shop Expenses",
        value: `Rs. ${shopExpenses.toLocaleString()}`,
        change: `${expenses.filter(e => e.category === 'shop').length} items`,
        trend: "down",
        icon: Store,
        color: "from-blue-500 to-cyan-600",
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
        textColor: "text-blue-600 dark:text-blue-400",
    },
    {
        title: "Transport Expenses",
        value: `Rs. ${transportExpenses.toLocaleString()}`,
        change: `${expenses.filter(e => e.category === 'transport').length} items`,
        trend: "down",
        icon: Truck,
        color: "from-amber-500 to-orange-600",
        bgColor: "bg-amber-50 dark:bg-amber-900/20",
        textColor: "text-amber-600 dark:text-amber-400",
    },
    {
        title: "Low Stock Items",
        value: lowStockCount.toString(),
        change: lowStockCount > 0 ? `${lowStockCount} items` : "All good",
        trend: lowStockCount > 0 ? "down" : "up",
        icon: AlertTriangle,
        color: lowStockCount > 0 ? "from-red-500 to-orange-600" : "from-emerald-500 to-teal-600",
        bgColor: lowStockCount > 0 ? "bg-red-50 dark:bg-red-900/20" : "bg-emerald-50 dark:bg-emerald-900/20",
        textColor: lowStockCount > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400",
    },
    {
        title: "Total Sales",
        value: sales.length.toString(),
        change: "Active Sales",
        trend: "up",
        icon: ShoppingBag,
        color: "from-purple-500 to-indigo-600",
        bgColor: "bg-purple-50 dark:bg-purple-900/20",
        textColor: "text-purple-600 dark:text-purple-400",
    },
    {
        title: "Inventory Items",
        value: products.length.toString(),
        change: "Active Items",
        trend: "up",
        icon: Package,
        color: "from-orange-500 to-amber-600",
        bgColor: "bg-orange-50 dark:bg-orange-900/20",
        textColor: "text-orange-600 dark:text-orange-400",
    },
    ];

    return (
        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4'>
            {stats.map((stats, index) => {
                return (
                    <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6
                            border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl
                            hover:shadow-slate-200/20 dark:hover:shadow-slate-900/20 transition-all duration-300 group'
                        key={index}>
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <p className='text-sm font-medium text-slate-600 dark:text-slate-400 mb-2'>
                                    {stats.title}
                                </p>
                                <p className='text-3xl font-bold text-slate-800 dark:text-white mb-4'>
                                    {stats.value}
                                </p>
                                <div className='flex items-center space-x-2'>
                                    {stats.trend === 'up' ? <ArrowUpRight className='w-4 h-4 text-emerald-500' /> : <ArrowDownRight className='w-4 h-4 text-red-500' />}
                                    <span className={`text-sm font-semibold ${stats.trend === 'up' ? "text-emerald-500" : "text-red-500"}`}>{stats.change}</span>
                                    <span className='text-sm text-slate-500 dark:text-slate-400 italic'> {stats.trend === 'up' ? 'Increase' : 'Expense'}</span>
                                </div>
                                {/* Progress bar */}
                                <div className="mt-4 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full bg-gradient-to-r ${stats.color} rounded-full transition-all duration-1000`}
                                        style={{ width: stats.trend === 'up' ? '75%' : '45%' }}
                                    ></div>
                                </div>
                            </div>
                            <div className={`p-3 rounded-xl ${stats.bgColor} group-hover:scale-110 transition-all duration-300`}>
                                {<stats.icon className={`w-6 h-6 ${stats.textColor}`} />}
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default StatsGrid
