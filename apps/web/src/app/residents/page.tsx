import { ResidentsPage } from '@/components/residents-page';
import { Sidebar } from '@/components/sidebar';

export const metadata = {
  title: 'Residents',
  description: 'Manage resident profiles, care levels and admission records.',
};

export default function ResidentsRoute() {
  return <><Sidebar/><ResidentsPage/></>;
}
