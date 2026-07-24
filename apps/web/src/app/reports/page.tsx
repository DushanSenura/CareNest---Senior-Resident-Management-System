import { ReportsPage } from '@/components/reports-page';
import { Sidebar } from '@/components/sidebar';

export const metadata={title:'Reports',description:'CareNest operational and resident care reports.'};
export default function ReportsRoute(){return <><Sidebar/><ReportsPage/></>}
