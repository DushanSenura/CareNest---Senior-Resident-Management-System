import { AuditLogsPage } from '@/components/audit-logs-page';
import { Sidebar } from '@/components/sidebar';

export const metadata={title:'Audit logs',description:'Review CareNest security and activity audit records.'};
export default function AuditLogsRoute(){return <><Sidebar/><AuditLogsPage/></>}
