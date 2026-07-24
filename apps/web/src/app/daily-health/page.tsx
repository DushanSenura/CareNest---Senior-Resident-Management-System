import { DailyHealthPage } from '@/components/daily-health-page';
import { Sidebar } from '@/components/sidebar';
export const metadata={title:'Daily health checks',description:'Record and review resident daily health reports.'};
export default function DailyHealthRoute(){return <><Sidebar/><DailyHealthPage/></>}
