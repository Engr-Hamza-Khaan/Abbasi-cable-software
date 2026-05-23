import { ShieldCheck } from 'lucide-react';
import UserManagement from './UserManagement';

const AdminManagement = () => (
  <UserManagement
    role="admin"
    title="Admin Management"
    subtitle="Create administrator accounts for shop management."
    formTitle="Add New Admin"
    listTitle="All Admins"
    listIcon={ShieldCheck}
    emptyMessage="No admins yet."
  />
);

export default AdminManagement;
