import { ResidentDetailPage } from '@/components/resident-detail';
import { Sidebar } from '@/components/sidebar';

export default async function ResidentRecordRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <><Sidebar/><ResidentDetailPage id={id}/></>;
}
