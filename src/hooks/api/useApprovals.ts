'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { approvalService, ApprovalFilterParams } from '@/services/approvalService';

export function useAssetApprovals(params?: ApprovalFilterParams) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['approvals', 'asset-pendings', params],
    queryFn: () => approvalService.getAssetPendings(params),
  });

  const approveMutation = useMutation({
    mutationFn: (id: number | string) => approvalService.approveAsset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals', 'asset-pendings'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['pwa', 'pending-count'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number | string; reason?: string }) =>
      approvalService.rejectAsset(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals', 'asset-pendings'] });
      queryClient.invalidateQueries({ queryKey: ['pwa', 'pending-count'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return {
    ...query,
    items: query.data?.data || [],
    meta: query.data?.meta,
    approve: approveMutation.mutateAsync,
    isApproving: approveMutation.isPending,
    reject: rejectMutation.mutateAsync,
    isRejecting: rejectMutation.isPending,
  };
}

export function usePengadaanApprovals(params?: ApprovalFilterParams) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['approvals', 'pengadaan-pendings', params],
    queryFn: () => approvalService.getPengadaanPendings(params),
  });

  const approveMutation = useMutation({
    mutationFn: (id: number | string) => approvalService.approvePengadaan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals', 'pengadaan-pendings'] });
      queryClient.invalidateQueries({ queryKey: ['pengadaan-assets'] });
      queryClient.invalidateQueries({ queryKey: ['pwa', 'pending-count'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number | string; reason?: string }) =>
      approvalService.rejectPengadaan(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals', 'pengadaan-pendings'] });
      queryClient.invalidateQueries({ queryKey: ['pwa', 'pending-count'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return {
    ...query,
    items: query.data?.data || [],
    meta: query.data?.meta,
    approve: approveMutation.mutateAsync,
    isApproving: approveMutation.isPending,
    reject: rejectMutation.mutateAsync,
    isRejecting: rejectMutation.isPending,
  };
}

export function useBorrowApprovals(params?: ApprovalFilterParams) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['approvals', 'borrow-pendings', params],
    queryFn: () => approvalService.getBorrowPendings(params),
  });

  const approveMutation = useMutation({
    mutationFn: (id: number | string) => approvalService.approveBorrow(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals', 'borrow-pendings'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['pwa', 'pending-count'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number | string; reason?: string }) =>
      approvalService.rejectBorrow(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals', 'borrow-pendings'] });
      queryClient.invalidateQueries({ queryKey: ['pwa', 'pending-count'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return {
    ...query,
    items: query.data?.data || [],
    meta: query.data?.meta,
    approve: approveMutation.mutateAsync,
    isApproving: approveMutation.isPending,
    reject: rejectMutation.mutateAsync,
    isRejecting: rejectMutation.isPending,
  };
}

export function useMaintenanceApprovals(params?: ApprovalFilterParams) {
  const query = useQuery({
    queryKey: ['approvals', 'maintenance-pendings', params],
    queryFn: () => approvalService.getMaintenancePendings(params),
  });

  return {
    ...query,
    items: query.data?.data || [],
    meta: query.data?.meta,
  };
}
