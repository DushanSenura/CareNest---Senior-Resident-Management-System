import { AccountsPage } from '@/components/accounts-page';
import { Sidebar } from '@/components/sidebar';

export const metadata={title:'Accounts',description:'View CareNest staff login accounts.'};
export default function AccountsRoute(){return <><Sidebar/><AccountsPage/></>}
