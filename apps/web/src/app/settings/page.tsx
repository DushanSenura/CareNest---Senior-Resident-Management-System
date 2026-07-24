import { SettingsPage } from '@/components/settings-page';
import { Sidebar } from '@/components/sidebar';
export const metadata={title:'Settings',description:'Manage CareNest profile, security and preferences.'};
export default function SettingsRoute(){return <><Sidebar/><SettingsPage/></>}
