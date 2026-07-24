import { BranchesPage } from '@/components/branches-page';
import { Sidebar } from '@/components/sidebar';

export const metadata={title:'Branches',description:'Manage CareNest residential care branches.'};
export default function BranchesRoute(){return <><Sidebar/><BranchesPage/></>}
