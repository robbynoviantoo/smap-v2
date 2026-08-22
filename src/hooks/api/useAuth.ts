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
    isError,
    error,
    refetchUser: refetch,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
  };
}
