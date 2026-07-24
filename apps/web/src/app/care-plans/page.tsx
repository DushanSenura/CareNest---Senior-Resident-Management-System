import { CarePlansPage } from '@/components/care-plans-page';
import { Sidebar } from '@/components/sidebar';

export const metadata = {
  title: 'Care plans',
  description: 'Create, review and manage person-centred resident care plans.',
};

export default function CarePlansRoute() {
  return <><Sidebar/><CarePlansPage/></>;
}
