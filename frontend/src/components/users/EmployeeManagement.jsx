import { Users } from 'lucide-react';
import UserManagement from './UserManagement';

const EmployeeManagement = () => (
  <UserManagement
    role="employee"
    title="Employee Management"
    subtitle="Create staff accounts and assign them to a shop."
    formTitle="Add New Employee"
    listTitle="All Employees"
    listIcon={Users}
    emptyMessage="No employees yet."
  />
);

export default EmployeeManagement;
