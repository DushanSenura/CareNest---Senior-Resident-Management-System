import { Sidebar } from '@/components/sidebar';
import { StaffPage } from '@/components/staff-page';
export const metadata={title:'Staff',description:'Manage CareNest staff records, roles and status.'};
export default function StaffRoute(){return <><Sidebar/><StaffPage/></>}
