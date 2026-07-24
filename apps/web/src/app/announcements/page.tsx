import { AnnouncementsPage } from '@/components/announcements-page';
import { Sidebar } from '@/components/sidebar';

export const metadata={title:'Announcements',description:'Create and manage CareNest announcements.'};
export default function AnnouncementsRoute(){return <><Sidebar/><AnnouncementsPage/></>}
