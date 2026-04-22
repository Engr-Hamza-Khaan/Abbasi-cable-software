import { MoreHorizontal, TrendingUp, TrendingDown } from 'lucide-react'

function TableSection({ products = [], sales = [] }) {
    // Transform sales to match recentOrder format
    const dynamicRecentOrders = sales.map(s => ({
        id: `#${s.id.toString().slice(-4)}`,
        customer: s.customer || "Walking Customer",
        product: s.productName,
        amount: `${s.total.toLocaleString()} PKR`,
        status: "Completed",
        date: s.date,
    }));

    const recentOrder = dynamicRecentOrders.length > 0 ? dynamicRecentOrders : [
        { id: "#1001", customer: "Ali Raza", product: "Wireless Earbuds", amount: "2500PKR", status: "Completed", date: "2025-10-10" },
        { id: "#1002", customer: "Sara Khan", product: "Smart Watch", amount: "3500PKR", status: "Pending", date: "2025-10-11" },
        { id: "#1003", customer: "Ahmed Malik", product: "Laptop Bag", amount: "1500PKR", status: "Cancelled", date: "2025-10-09" },
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case "Completed": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
            case "Pending": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
            case "Cancelled": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
            case "Processing": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
            default: return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
        }
    };

    // Calculate dynamic top products
    const productSales = {};
    sales.forEach(s => {
        productSales[s.productName] = (productSales[s.productName] || 0) + s.quantity;
    });

    const dynamicTopProducts = Object.keys(productSales).map(name => {
        const product = products.find(p => p.name === name);
        return {
            name: name,
            sales: `${productSales[name]} Units`,
            revenue: `${(productSales[name] * 100).toLocaleString()}PKR`, // Placeholder revenue logic
            trend: "up",
            change: "+100%"
        };
    }).sort((a, b) => b.sales - a.sales).slice(0, 5);

    const topProducts = dynamicTopProducts.length > 0 ? dynamicTopProducts : [
        { name: "Smartphone", sales: "1200 Sales", revenue: "240000", trend: "up", change: "+12%" },
        { name: "Laptop", sales: "950 Sales", revenue: "475000", trend: "up", change: "+8%" },
        // ... fallback
    ];



    return (
        <div className="space-y-6">
            {/* recent Order */}
            <div className='bg-white dark:bg-slate-900/80 backdrop-blur-xl rounded-b-2xl 
                border border-slate-200/50 dark:border-slate-700/50 overflow-hidden'
            >
                <div className='p-6 border-b border-slate-200/50 dark:border-slate-700/50'>
                    <div className='flex items-center justify-between'>
                        <div>
                            <h3 className='text-lg font-bold text-slate-800 dark:text-white'>
                                Recent Order
                            </h3>
                            <p className='text-sm text-slate-500 dark:text-slate-400'>
                                Latest Customer Orders
                            </p>
                        </div>
                        <button className='text-blue-600 hover:text-blue-700 text-sm font-medium'>
                            View All
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className='w-full'>
                        <thead>
                            <tr>
                                <th className='text-left p-4 text-sm font-semibold text-slate-600'>
                                    Order ID
                                </th>
                                <th className='text-left p-4 text-sm font-semibold text-slate-600'>
                                    Customer Name
                                </th>
                                <th className='text-left p-4 text-sm font-semibold text-slate-600'>
                                    Product
                                </th>
                                <th className='text-left p-4 text-sm font-semibold text-slate-600'>
                                    Amount
                                </th>
                                <th className='text-left p-4 text-sm font-semibold text-slate-600'>
                                    Status
                                </th>
                                <th className='text-left p-4 text-sm font-semibold text-slate-600'>
                                    Date
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrder.map((order, index) => {
                                return (
                                    <tr className='border-b border-slate-200/50 dark:border-slate-700/50
                                     hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors'>
                                        <td className='p-4' key={index}>
                                            <span className='text-sm font-medium text-blue'>
                                                {order.id}
                                            </span>
                                        </td>
                                        <td className='p-4'>
                                            <span className='text-sm text-slate-800 dark:text-white'>
                                                {order.customer}
                                            </span>
                                        </td>
                                        <td className='p-4'>
                                            <span className='text-sm text-slate-800 dark:text-white'>
                                                {order.product}
                                            </span>
                                        </td>
                                        <td className='p-4'>
                                            <span className='text-sm text-slate-800 dark:text-white'>
                                                {order.amount}
                                            </span>
                                        </td>
                                        <td className='p-4'>
                                            <span className={`${getStatusColor(order.status)} font-medium text-xs px-3 py-1 rounded-full`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className='p-4'>
                                            <span className='text-sm text-slate-800 dark:text-white'>
                                                {order.date}
                                            </span>
                                        </td>
                                        <td className='p-4'>
                                            <span className='text-sm text-slate-800 dark:text-white'>
                                                <MoreHorizontal className='w-4 h-4' />
                                            </span>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Top Products */}
            <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl
            rounded-2xl border border-slate-200/50 overflow-hidden'>
                <div className='p-6 border-slate-200/50 dark:border-slate-700/50'>
                    <div className='flex items-center justify-between'>
                        <div className='text-lg font-bold text-slate-800 dark:text-white'>
                            <h3 className='text-lg font-bold text-slate-800 dark:text-white'>
                                Top Products
                            </h3>
                        </div>
                        <p className='text-sm text-slate-500 dark:text-slate-400'>
                            Best Performing Products
                        </p>
                    </div>
                    <button className='text-blue-600 hover:text-blue-700 text-sm font-medium'>
                        View All
                    </button>
                </div>
                {/* Dynamic Data */}
                <div className='p-6 space-y-4' >
                    {topProducts.map((product, index) => {
                        return (
                            <div className='flex items-center justify-between p-4 rounded-xl hover:bg-slate-50
                              dark:hover:bg-slate-800/50 transition-colors' key={index}>
                                <div className="flex-1">
                                    <h4 className='text-sm font-semibold text-slate-800 dark:text-white'>
                                        {product.name}
                                    </h4>
                                    <p className='text-xs text-slate-500 dark:text-slate-400'>
                                        {product.sales}
                                    </p>
                                </div>
                                <div className='text-right'>
                                    <p className='text-sm font-semibold text-slate-800 dark:text-white'>
                                        {product.revenue}
                                    </p>
                                    <div className='flex items-center space-x-1'>
                                        {product.trend === 'up' ? (<TrendingUp className="w-3 h-3 text-emerald-500" />) : (<TrendingDown className="w-3 h-3 text-red-500" />)}
                                        <span>{product.change}</span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default TableSection
