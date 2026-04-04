import StatsGrid from "./StatsGrid"
import ChartSection from "./ChartSection"
import TableSection from './TableSection'
import ActivityFeed from "./ActivityFeed"

function Dashboard({ products, sales, purchases }) {
  return (
    <div className="space-y-6 ">
      {/* Stats Grid */}
      <StatsGrid products={products} sales={sales} purchases={purchases} />
      {/* Charts Section */}
      <ChartSection />
      {/* Table Section */}
      <div className='grid grid-cols-1 xl:grid-cols-3 gap-6'>
        <div className='xl:col-span-2'>
          <TableSection products={products} sales={sales} />
        </div>
        <div className='space-y-6'>
        <ActivityFeed/>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
