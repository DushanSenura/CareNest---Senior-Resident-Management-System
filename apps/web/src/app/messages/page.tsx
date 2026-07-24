import { MessagesPage } from '@/components/messages-page';
import { Sidebar } from '@/components/sidebar';

export const metadata={title:'Messages',description:'Secure CareNest staff communication.'};
export default function MessagesRoute(){return <><Sidebar/><MessagesPage/></>}
