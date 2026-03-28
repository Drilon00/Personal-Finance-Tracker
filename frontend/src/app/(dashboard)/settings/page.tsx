'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Lock, Trash2, Eye, EyeOff, CheckCircle, Save } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FilterDropdown } from '@/components/ui/filter-dropdown';
import { Dialog, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useUpdateProfile, useChangePassword, useDeleteAccount } from '@/hooks/useUser';
import { getInitials } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  currency: z.enum(['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY']),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Required'),
  newPassword: z.string().min(8, 'At least 8 characters').regex(/[A-Z]/, 'Needs uppercase').regex(/[0-9]/, 'Needs a number'),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

const CURRENCIES = [
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'GBP', label: 'GBP — British Pound' },
  { value: 'JPY', label: 'JPY — Japanese Yen' },
  { value: 'CAD', label: 'CAD — Canadian Dollar' },
  { value: 'AUD', label: 'AUD — Australian Dollar' },
  { value: 'CHF', label: 'CHF — Swiss Franc' },
  { value: 'CNY', label: 'CNY — Chinese Yuan' },
];

export default function SettingsPage() {
  const { user, logout, refreshUser } = useAuth();
  const { success, error } = useToast();
  const router = useRouter();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const deleteAccount = useDeleteAccount();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  const profileForm = useForm({ resolver: zodResolver(profileSchema), defaultValues: { name: user?.name ?? '', currency: (user?.currency ?? 'USD') as 'USD' } });

  useEffect(() => {
    if (user) {
      profileForm.reset({ name: user.name, currency: (user.currency ?? 'USD') as 'USD' });
    }
  }, [user]);
  const passwordForm = useForm({ resolver: zodResolver(passwordSchema), defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' } });

  const onProfileSubmit = async (data: z.infer<typeof profileSchema>) => {
    try {
      await updateProfile.mutateAsync(data);
      await refreshUser();
      success('Profile updated', 'Your changes have been saved.');
    } catch (err: unknown) {
      error('Update failed', (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Something went wrong.');
    }
  };

  const onPasswordSubmit = async (data: z.infer<typeof passwordSchema>) => {
    try {
      await changePassword.mutateAsync(data);
      success('Password changed', 'Please log in again with your new password.');
      passwordForm.reset();
      await logout();
      router.push('/login');
    } catch (err: unknown) {
      error('Password change failed', (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Something went wrong.');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount.mutateAsync(deletePassword);
      await logout();
      router.push('/login');
    } catch (err: unknown) {
      error('Delete failed', (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Incorrect password.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Profile section */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2"><User className="h-4 w-4 text-slate-400" />Profile</CardTitle>
            <CardDescription className="mt-0.5">Update your personal information</CardDescription>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 text-lg font-bold">
            {getInitials(user?.name ?? 'U')}
          </div>
        </CardHeader>

        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-xs font-medium text-slate-500">Email address</p>
            <p className="text-sm font-semibold text-slate-900 mt-0.5">{user?.email}</p>
            <p className="text-xs text-slate-400 mt-0.5">Email cannot be changed</p>
          </div>
          <Input label="Full name" placeholder="Your name" error={profileForm.formState.errors.name?.message} {...profileForm.register('name')} />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Currency</label>
            <Controller
              name="currency"
              control={profileForm.control}
              render={({ field }) => (
                <FilterDropdown
                  options={CURRENCIES}
                  placeholder="Select currency"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                />
              )}
            />
            {profileForm.formState.errors.currency && <p className="text-xs text-red-500">{profileForm.formState.errors.currency.message}</p>}
          </div>
          <Button type="submit" leftIcon={<Save className="h-4 w-4" />} loading={profileForm.formState.isSubmitting}>Save changes</Button>
        </form>
      </Card>

      {/* Password section */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2"><Lock className="h-4 w-4 text-slate-400" />Change Password</CardTitle>
            <CardDescription className="mt-0.5">You will be logged out after changing your password</CardDescription>
          </div>
        </CardHeader>

        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
          <Input
            label="Current password" type={showCurrent ? 'text' : 'password'} placeholder="Your current password"
            rightElement={<button type="button" onClick={() => setShowCurrent(v => !v)} className="text-slate-400 hover:text-slate-600">{showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>}
            error={passwordForm.formState.errors.currentPassword?.message}
            {...passwordForm.register('currentPassword')}
          />
          <Input
            label="New password" type={showNew ? 'text' : 'password'} placeholder="New secure password"
            rightElement={<button type="button" onClick={() => setShowNew(v => !v)} className="text-slate-400 hover:text-slate-600">{showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>}
            error={passwordForm.formState.errors.newPassword?.message}
            {...passwordForm.register('newPassword')}
          />
          <Input label="Confirm new password" type="password" placeholder="Repeat new password" error={passwordForm.formState.errors.confirmPassword?.message} {...passwordForm.register('confirmPassword')} />
          <Button type="submit" leftIcon={<CheckCircle className="h-4 w-4" />} loading={passwordForm.formState.isSubmitting}>Change password</Button>
        </form>
      </Card>

      {/* Danger zone */}
      <Card className="border-red-100">
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2 text-red-600"><Trash2 className="h-4 w-4" />Danger Zone</CardTitle>
            <CardDescription className="mt-0.5">Permanently delete your account and all data</CardDescription>
          </div>
        </CardHeader>
        <Button variant="danger" leftIcon={<Trash2 className="h-4 w-4" />} onClick={() => setDeleteOpen(true)}>Delete my account</Button>
      </Card>

      {/* Delete account dialog */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Account?" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">This will permanently delete your account, all transactions, categories, and budgets. <strong>This cannot be undone.</strong></p>
          <Input label="Enter your password to confirm" type="password" placeholder="Your password" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} />
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDeleteAccount} loading={deleteAccount.isPending} disabled={!deletePassword}>Delete account</Button>
          </DialogFooter>
        </div>
      </Dialog>
    </div>
  );
}
