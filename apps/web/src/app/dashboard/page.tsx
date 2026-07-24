import { Dashboard } from '@/components/dashboard';
import { Sidebar } from '@/components/sidebar';

export const metadata = {
  title: 'Dashboard',
  description: 'CareNest resident care and operations dashboard.',
};

export default function DashboardPage() {
  return <><Sidebar/><Dashboard/></>;
}
