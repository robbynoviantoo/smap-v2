'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { souvenirService, BaseFilterParams } from '@/services/souvenirService';

export function useSouvenirNames(params?: BaseFilterParams) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['souvenirs', 'names', params],
    queryFn: () => souvenirService.getNames(params),
  });

  const createMutation = useMutation({
    mutationFn: souvenirService.createName,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['souvenirs', 'names'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: { name: string; description?: string } }) =>
      souvenirService.updateName(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['souvenirs', 'names'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number | string) => souvenirService.deleteName(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['souvenirs', 'names'] });
    },
  });

  return {
    ...query,
    items: query.data?.data || [],
    meta: query.data?.meta,
    createName: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateName: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteName: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}

export function useSouvenirs(params?: BaseFilterParams) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['souvenirs', 'stocks', params],
    queryFn: () => souvenirService.getSouvenirs(params),
  });

  const createMutation = useMutation({
    mutationFn: (data: FormData | Record<string, any>) => souvenirService.createSouvenir(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['souvenirs', 'stocks'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number | string) => souvenirService.deleteSouvenir(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['souvenirs', 'stocks'] });
    },
  });

  const addStockMutation = useMutation({
    mutationFn: (data: { souvenir_id: number; qty: number; date: string; notes?: string }) =>
      souvenirService.addStock(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['souvenirs', 'stocks'] });
      queryClient.invalidateQueries({ queryKey: ['souvenirs', 'additions'] });
    },
  });

  return {
    ...query,
    items: query.data?.data || [],
    meta: query.data?.meta,
    createSouvenir: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    deleteSouvenir: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    addStock: addStockMutation.mutateAsync,
    isAddingStock: addStockMutation.isPending,
  };
}

export function useSouvenirTransactions(
  params?: BaseFilterParams & { souvenir_id?: number | string; status?: string }
) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['souvenirs', 'transactions', params],
    queryFn: () => souvenirService.getTransactions(params),
  });

  const createMutation = useMutation({
    mutationFn: souvenirService.createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['souvenirs', 'transactions'] });
      queryClient.invalidateQueries({ queryKey: ['souvenirs', 'stocks'] });
    },
  });

  const finishMutation = useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: any }) =>
      souvenirService.finishTransaction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['souvenirs', 'transactions'] });
      queryClient.invalidateQueries({ queryKey: ['souvenirs', 'stocks'] });
    },
  });

  const recallMutation = useMutation({
    mutationFn: ({ id, data }: { id: number | string; data?: any }) =>
      souvenirService.recallTransaction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['souvenirs', 'transactions'] });
      queryClient.invalidateQueries({ queryKey: ['souvenirs', 'stocks'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number | string) => souvenirService.deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['souvenirs', 'transactions'] });
      queryClient.invalidateQueries({ queryKey: ['souvenirs', 'stocks'] });
    },
  });

  return {
    ...query,
    items: query.data?.data || [],
    meta: query.data?.meta,
    createTransaction: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    finishTransaction: finishMutation.mutateAsync,
    isFinishing: finishMutation.isPending,
    recallTransaction: recallMutation.mutateAsync,
    isRecalling: recallMutation.isPending,
    deleteTransaction: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
