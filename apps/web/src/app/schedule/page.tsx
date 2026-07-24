import { SchedulePage } from '@/components/schedule-page';
import { Sidebar } from '@/components/sidebar';

export const metadata={title:'Schedule',description:'CareNest appointments, activities and staff schedule.'};
export default function ScheduleRoute(){return <><Sidebar/><SchedulePage/></>}
