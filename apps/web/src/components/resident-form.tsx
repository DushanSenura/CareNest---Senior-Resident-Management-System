'use client';
import * as Dialog from '@radix-ui/react-dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { z } from 'zod';
import { Button } from './ui';
import { X } from 'lucide-react';

const schema = z.object({
  firstName: z.string().min(2, 'Enter a first name'),
  lastName: z.string().min(2, 'Enter a last name'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  room: z.string().min(1, 'Assign a room'),
  emergencyName: z.string().min(2, 'Add an emergency contact'),
  emergencyPhone: z.string().min(7, 'Enter a valid phone number'),
});
type FormData = z.infer<typeof schema>;

export function ResidentForm({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string>();
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({ resolver: zodResolver(schema) });
  const submit = async (data: FormData) => {
    setSubmitError(undefined);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1'}/residents`, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...data, facilityId: 'demo-facility', priority: 'MEDIUM', allergies: [], dietaryNeeds: [], admissionDate: new Date().toISOString() }),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => undefined);
        throw new Error(result?.message?.join?.(', ') || result?.message || 'Could not admit resident');
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['residents'] }),
        queryClient.invalidateQueries({ queryKey: ['summary'] }),
      ]);
      reset();
      setOpen(false);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Could not admit resident');
    }
  };
  return <Dialog.Root open={open} onOpenChange={(nextOpen) => { setOpen(nextOpen); if (nextOpen) setSubmitError(undefined); }}><Dialog.Trigger asChild>{trigger}</Dialog.Trigger><Dialog.Portal>
    <Dialog.Overlay className="fixed inset-0 z-40 bg-ink/50 backdrop-blur-sm"/>
    <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-2xl bg-white p-6 shadow-2xl">
      <Dialog.Title className="text-xl font-bold">Admit a new resident</Dialog.Title><Dialog.Description className="mt-1 text-sm text-sage">Create their core profile. Clinical details can be completed afterward.</Dialog.Description>
      <Dialog.Close className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-xl hover:bg-mint"><X size={18}/></Dialog.Close>
      <form onSubmit={handleSubmit(submit)} className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="First name" error={errors.firstName?.message}><input {...register('firstName')} /></Field>
        <Field label="Last name" error={errors.lastName?.message}><input {...register('lastName')} /></Field>
        <Field label="Date of birth" error={errors.dateOfBirth?.message}><input type="date" {...register('dateOfBirth')} /></Field>
        <Field label="Room" error={errors.room?.message}><input placeholder="e.g. A-104" {...register('room')} /></Field>
        <Field label="Emergency contact" error={errors.emergencyName?.message}><input {...register('emergencyName')} /></Field>
        <Field label="Contact phone" error={errors.emergencyPhone?.message}><input type="tel" {...register('emergencyPhone')} /></Field>
        {submitError && <div role="alert" className="rounded-xl bg-[#fff0ec] px-4 py-3 text-sm font-medium text-coral sm:col-span-2">{submitError}</div>}
        <div className="mt-2 flex justify-end gap-3 sm:col-span-2"><Dialog.Close asChild><button type="button" className="h-10 rounded-xl border px-4 text-sm font-semibold">Cancel</button></Dialog.Close><Button disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Create resident'}</Button></div>
      </form>
    </Dialog.Content>
  </Dialog.Portal></Dialog.Root>;
}
function Field({label,error,children}:{label:string;error?:string;children:React.ReactElement}){
  return <label className="text-sm font-semibold">{label}{<div className="[&_input]:focus-ring [&_input]:mt-1.5 [&_input]:h-11 [&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:px-3 [&_input]:font-normal">{children}</div>}{error&&<span className="mt-1 block text-xs text-coral">{error}</span>}</label>;
}
