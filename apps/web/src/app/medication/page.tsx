import { MedicationPage } from '@/components/medication-page';
import { Sidebar } from '@/components/sidebar';

export const metadata = { title: 'Medication', description: 'Manage resident medication and stock.' };
export default function MedicationRoute() { return <><Sidebar/><MedicationPage/></>; }
