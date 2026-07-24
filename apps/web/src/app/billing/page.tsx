import { BillingPage } from '@/components/billing-page';
import { Sidebar } from '@/components/sidebar';

export const metadata={title:'Billing',description:'Manage CareNest resident invoices and payments.'};
export default function BillingRoute(){return <><Sidebar/><BillingPage/></>}
