import { LoginBrand, LoginForm } from '@/components/login-form';
import { ShieldCheck, Users } from 'lucide-react';
import Image from 'next/image';
import careNestLogo from '@/assets/CareNest.png';

export const metadata = {
  title: 'Staff login',
  description: 'Secure staff access to CareNest resident care management.',
};

export default function LoginPage() {
  return <main className="grid min-h-screen bg-cream lg:grid-cols-[1.05fr_.95fr]">
    <section className="relative hidden overflow-hidden bg-ink p-12 text-white lg:flex lg:flex-col lg:justify-between">
      <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-sage/15"/><div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-coral/10"/>
      <div className="relative flex items-center gap-3"><div className="relative h-12 w-12 overflow-hidden rounded-full"><Image src={careNestLogo} alt="CareNest system logo" priority className="h-full w-full rounded-full object-cover" style={{transform:'scale(1.75) translateY(11%)'}}/></div><div><div className="text-xl font-bold">CareNest</div><div className="text-xs text-white/55">Care. Comfort. Community.</div></div></div>
      <div className="relative max-w-xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-sage">Thoughtful care starts here</p><h1 className="mt-5 text-5xl font-bold leading-[1.08] tracking-tight">Everything your team needs to care with confidence.</h1><p className="mt-6 max-w-lg text-lg leading-relaxed text-white/65">Resident records, care plans, medication, staff and daily operations—all in one secure place.</p>
        <div className="mt-10 grid grid-cols-2 gap-4"><div className="rounded-2xl border border-white/10 bg-white/5 p-5"><Users className="text-sage"/><p className="mt-3 font-semibold">Person-centred records</p><p className="mt-1 text-sm text-white/50">The right information at the right time.</p></div><div className="rounded-2xl border border-white/10 bg-white/5 p-5"><ShieldCheck className="text-sage"/><p className="mt-3 font-semibold">Secure staff access</p><p className="mt-1 text-sm text-white/50">Role-aware authentication and safe data.</p></div></div>
      </div>
      <div aria-hidden="true"/>
    </section>

    <section className="flex min-h-screen items-center justify-center p-5 sm:p-10">
      <div className="w-full max-w-md">
        <div className="lg:hidden"><LoginBrand/></div>
        <div className="card mt-8 p-6 sm:p-8 lg:mt-0">
          <div className="hidden lg:block"><LoginBrand/></div>
          <div className="mt-8"><p className="eyebrow">Welcome back</p><h2 className="mt-2 text-3xl font-bold tracking-tight">Sign in to your account</h2><p className="mt-2 text-sm leading-relaxed text-sage">Use the email address and password provided with your staff account.</p></div>
          <LoginForm/>
        </div>
        <p className="mt-5 text-center text-xs text-sage">Need access? Contact your CareNest administrator.</p>
      </div>
    </section>
  </main>;
}
