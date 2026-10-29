'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/authService';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();

  // Query: Ambil data user login saat ini
  const {
    data: userResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authService.me,
    enabled: typeof window !== 'undefined' && !!(Cookies.get('token') || localStorage.getItem('token')),
    staleTime: 5 * 60 * 1000,
  });

  // Mutation: Login
  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'me'], { success: true, message: 'OK', data: data.data.user });
      
      const targetUrl = data.data.user?.is_first_login ? '/onboarding' : '/';
      // Gunakan window.location.replace agar membersihkan client-side router cache Next.js,
      // sehingga browser langsung beralih ke halaman dashboard pada klik pertama tanpa jeda/stuck.
      if (typeof window !== 'undefined') {
        window.location.replace(targetUrl);
      } else {
        router.push(targetUrl);
      }
    },
  });

  // Mutation: Onboarding (Ganti Password Pertama Kali)
  const onboardingMutation = useMutation({
    mutationFn: authService.completeOnboarding,
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'me'], { success: true, message: 'OK', data: data.data });
      router.push('/');
    },
  });

  // Mutation: Logout
  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      queryClient.clear();
      router.push('/signin');
    },
  });

  return {
    user: userResponse?.data,
    isLoading,
    isAuthenticated: !!userResponse?.data,
    isFirstLogin: !!userResponse?.data?.is_first_login,
    isError,
    error,
    refetchUser: refetch,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    completeOnboarding: onboardingMutation.mutateAsync,
    isOnboarding: onboardingMutation.isPending,
    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
  };
}
