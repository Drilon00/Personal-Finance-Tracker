import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/lib/api';

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name?: string; currency?: string }) =>
      userApi.updateProfile(data as Record<string, unknown>),
    onSuccess: () => {
      // Invalidate auth queries so useAuth refetches the updated user
      qc.invalidateQueries({ queryKey: ['auth'] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string; confirmPassword: string }) =>
      userApi.changePassword(data as Record<string, unknown>),
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: (password: string) => userApi.deleteAccount(password),
  });
}
