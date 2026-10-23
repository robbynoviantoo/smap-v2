'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { pengadaanService } from '@/services/pengadaanService';
import { PengadaanFilterParams, PengadaanProgress } from '@/types/pengadaan';

export function usePengadaan(params?: PengadaanFilterParams) {
  const queryClient = useQueryClient();

  const {
    data: listResponse,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['pengadaan-assets', params],
    queryFn: () => pengadaanService.getPengadaanList(params),
  });

  const createMutation = useMutation({
    mutationFn: (data: FormData | Record<string, any>) =>
      pengadaanService.createPengadaan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pengadaan-assets'] });
      queryClient.invalidateQueries({ queryKey: ['pwa', 'pending-count'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: Record<string, any> }) =>
      pengadaanService.updatePengadaan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pengadaan-assets'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number | string) => pengadaanService.deletePengadaan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pengadaan-assets'] });
    },
  });

  const updateProgressMutation = useMutation({
    mutationFn: ({ id, progress }: { id: number | string; progress: PengadaanProgress }) =>
      pengadaanService.updateProgress(id, progress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pengadaan-assets'] });
    },
  });

  const storeDeliveryMutation = useMutation({
    mutationFn: ({ id, formData }: { id: number | string; formData: FormData }) =>
      pengadaanService.storeDelivery(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pengadaan-assets'] });
    },
  });

  const storeReturMutation = useMutation({
    mutationFn: ({
      id,
      deliveryId,
      formData,
    }: {
      id: number | string;
      deliveryId: number | string;
      formData: FormData;
    }) => pengadaanService.storeRetur(id, deliveryId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pengadaan-assets'] });
    },
  });

  const storeDispositionMutation = useMutation({
    mutationFn: ({
      id,
      deliveryId,
      data,
    }: {
      id: number | string;
      deliveryId: number | string;
      data: any;
    }) => pengadaanService.storeDisposition(id, deliveryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pengadaan-assets'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });

  const finishMutation = useMutation({
    mutationFn: (id: number | string) => pengadaanService.finishPengadaan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pengadaan-assets'] });
    },
  });

  return {
    pengadaanList: listResponse?.data || [],
    meta: listResponse?.meta,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    createPengadaan: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updatePengadaan: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deletePengadaan: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    updateProgress: updateProgressMutation.mutateAsync,
    isUpdatingProgress: updateProgressMutation.isPending,
    storeDelivery: storeDeliveryMutation.mutateAsync,
    isStoringDelivery: storeDeliveryMutation.isPending,
    storeRetur: storeReturMutation.mutateAsync,
    isStoringRetur: storeReturMutation.isPending,
    storeDisposition: storeDispositionMutation.mutateAsync,
    isStoringDisposition: storeDispositionMutation.isPending,
    finishPengadaan: finishMutation.mutateAsync,
    isFinishing: finishMutation.isPending,
  };
}
