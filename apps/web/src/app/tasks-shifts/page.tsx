import { Sidebar } from '@/components/sidebar';
import { TasksShiftsPage } from '@/components/tasks-shifts-page';
export const metadata={title:'Tasks & shifts',description:'Coordinate CareNest care tasks and staff shifts.'};
export default function TasksShiftsRoute(){return <><Sidebar/><TasksShiftsPage/></>}
