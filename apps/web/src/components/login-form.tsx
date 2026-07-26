'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, UserRoundCog } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { roleHome } from '@/lib/access';
import { Button } from './ui';
import careNestLogo from '@/assets/CareNest.png';

function loginApiUrl() {
  const configured = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';
  if (typeof window === 'undefined') return configured;
  const url = new URL(configured);
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') url.hostname = window.location.hostname;
  return url.toString().replace(/\/$/, '');
}
const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must contain at least 8 characters'),
  remember: z.boolean(),
});
type LoginForm = z.infer<typeof schema>;
type LoginResponse = {
  accessToken: string;
  permissions: string[];
  mustChangePassword: boolean;
  staff: { id: string; firstName: string; lastName: string; email: string; role: string; facilityId: string; linkedResidentId?: string };
};
const roleAccounts = [
  { role: 'Super Admin', email: 'superadmin@carenest.local', password: 'SuperAdmin@123' },
  { role: 'Admin', email: 'admin@carenest.local', password: 'Admin@123' },
  { role: 'Care Manager', email: 'caremanager@carenest.local', password: 'CareManager@123' },
  { role: 'Caregiver', email: 'caregiver@carenest.local', password: 'Caregiver@123' },
  { role: 'Nurse', email: 'nurse.account@carenest.local', password: 'Nurse@123' },
  { role: 'Doctor', email: 'doctor@carenest.local', password: 'Doctor@123' },
  { role: 'HR Manager', email: 'hr@carenest.local', password: 'HRManager@123' },
] as const;

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string>();
  const [selectedRole, setSelectedRole] = useState<string>();
  const { register, handleSubmit, setValue, clearErrors, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', remember: true },
  });
  const selectRole = (account: (typeof roleAccounts)[number]) => {
    setSelectedRole(account.role);
    setValue('email', account.email, { shouldDirty: true, shouldValidate: true });
    setValue('password', account.password, { shouldDirty: true, shouldValidate: true });
    clearErrors();
    setLoginError(undefined);
  };

  const login = async (data: LoginForm) => {
    setLoginError(undefined);
    try {
      const response = await fetch(`${loginApiUrl()}/auth/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => undefined);
        throw new Error(result?.message || 'Unable to sign in');
      }
      const result = await response.json() as LoginResponse;
      const storage = data.remember ? localStorage : sessionStorage;
      storage.setItem('carenest_access_token', result.accessToken);
      storage.setItem('carenest_staff', JSON.stringify(result.staff));
      storage.setItem('carenest_permissions', JSON.stringify(result.permissions));
      storage.setItem('carenest_must_change_password', String(result.mustChangePassword));
      const otherStorage = data.remember ? sessionStorage : localStorage;
      otherStorage.removeItem('carenest_access_token');
      otherStorage.removeItem('carenest_staff');
      otherStorage.removeItem('carenest_permissions');
      otherStorage.removeItem('carenest_must_change_password');
      const destination=roleHome(result.staff.role,result.staff.linkedResidentId);
      router.replace(destination);
      router.refresh();
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Unable to sign in');
    }
  };

  return <form onSubmit={handleSubmit(login)} className="mt-8 space-y-5">
    <div className="rounded-2xl border bg-cream/60 p-4">
      <div className="flex items-center gap-2">
        <UserRoundCog size={17} className="text-forest"/>
        <div><p className="text-sm font-bold text-ink">Select a login role</p><p className="text-[11px] text-sage">Development access · credentials fill automatically</p></div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {roleAccounts.map((account) => <button
          suppressHydrationWarning
          key={account.role}
          type="button"
          onClick={() => selectRole(account)}
          aria-pressed={selectedRole === account.role}
          className={`focus-ring min-h-10 rounded-xl border px-2 py-2 text-xs font-semibold ${
            selectedRole === account.role
              ? 'border-forest bg-forest text-white'
              : 'bg-white text-ink hover:border-sage hover:bg-mint'
          }`}
        >{account.role}</button>)}
      </div>
    </div>

    <label className="block text-sm font-semibold text-ink">
      Email address
      <div className="relative mt-2">
        <Mail className="pointer-events-none absolute left-3.5 top-3.5 text-sage" size={18}/>
        <input suppressHydrationWarning type="email" autoComplete="email" placeholder="you@carenest.com" {...register('email')} className="focus-ring h-12 w-full rounded-xl border bg-white pl-11 pr-4 font-normal"/>
      </div>
      {errors.email && <span className="mt-1.5 block text-xs text-coral">{errors.email.message}</span>}
    </label>

    <label className="block text-sm font-semibold text-ink">
      Password
      <div className="relative mt-2">
        <LockKeyhole className="pointer-events-none absolute left-3.5 top-3.5 text-sage" size={18}/>
        <input suppressHydrationWarning type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" {...register('password')} className="focus-ring h-12 w-full rounded-xl border bg-white pl-11 pr-12 font-normal"/>
        <button suppressHydrationWarning type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="focus-ring absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-lg text-sage hover:bg-mint hover:text-forest">{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
      </div>
      {errors.password && <span className="mt-1.5 block text-xs text-coral">{errors.password.message}</span>}
    </label>

    <div className="flex items-center justify-between">
      <label className="flex items-center gap-2 text-sm text-sage"><input suppressHydrationWarning type="checkbox" {...register('remember')} className="h-4 w-4 rounded border-sage accent-forest"/>Keep me signed in</label>
      <span className="text-xs text-sage">Secure staff access</span>
    </div>

    {loginError && <div role="alert" className="rounded-xl border border-coral/20 bg-[#fff0ec] px-4 py-3 text-sm font-medium text-coral">{loginError}</div>}
    <Button className="h-12 w-full text-base" disabled={isSubmitting}>{isSubmitting ? 'Signing in…' : 'Sign in to CareNest'}</Button>
    <div className="flex items-center justify-center gap-2 text-xs text-sage"><ShieldCheck size={15}/><span>Your account is protected with secure authentication.</span></div>
  </form>;
}

export function LoginBrand() {
  return <div className="flex items-center gap-3"><div className="relative h-12 w-12 overflow-hidden rounded-full shadow-sm"><Image src={careNestLogo} alt="CareNest system logo" priority className="h-full w-full rounded-full object-cover" style={{transform:'scale(1.75) translateY(11%)'}}/></div><div><div className="text-xl font-bold tracking-tight text-ink">CareNest</div><div className="text-xs text-sage">Resident care management</div></div></div>;
}
