import { AdmissionForm } from '@/components/admission-form';
import { Sidebar } from '@/components/sidebar';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata = { title: 'New admission', description: 'Create a complete CareNest resident admission record.' };

export default function NewResidentPage() {
  return <><Sidebar/><main className="min-h-screen lg:ml-64"><header className="border-b bg-white px-5 py-5 md:px-9"><div className="mx-auto max-w-[1500px]"><Link href="/residents" className="mb-3 flex items-center gap-1 text-sm font-semibold text-forest"><ArrowLeft size={16}/>Back to residents</Link><p className="eyebrow">Resident admissions</p><h1 className="mt-1 text-2xl font-bold">New resident admission</h1><p className="mt-1 text-sm text-sage">Build a complete clinical, personal and operational admission record.</p></div></header><div className="mx-auto max-w-[1500px] p-5 md:p-9"><AdmissionForm/></div></main></>;
}
