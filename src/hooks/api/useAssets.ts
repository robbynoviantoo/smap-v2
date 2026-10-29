'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { assetService, AssetFilterParams } from '@/services/assetService';
import { Asset } from '@/types/api';

export function useAssets(params?: AssetFilterParams) {
  const queryClient = useQueryClient();

  // Query: Get list assets with filters
  const {
    data: assetsResponse,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['assets', params],
    queryFn: () => assetService.getAssets(params),
  });

  // Query: Metadata dropdown options
  const { data: metadataResponse } = useQuery({
    queryKey: ['assets', 'metadata'],
    queryFn: assetService.getMetadata,
    staleTime: 10 * 60 * 1000,
  });

  // Mutation: Create Asset
  const createAssetMutation = useMutation({
    mutationFn: ({ imageFile, ...data }: Partial<Asset> & { imageFile?: File }) =>
      assetService.createAsset(data, imageFile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });

  // Mutation: Update Asset
  const updateAssetMutation = useMutation({
    mutationFn: ({ id, data, imageFile }: { id: number | string; data: Partial<Asset>; imageFile?: File }) =>
      assetService.updateAsset(id, data, imageFile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });

  // Mutation: Delete Asset
  const deleteAssetMutation = useMutation({
    mutationFn: (id: number | string) => assetService.deleteAsset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });

  return {
    assets: assetsResponse?.data || [],
    meta: assetsResponse?.meta,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    metadata: metadataResponse?.data,
    createAsset: createAssetMutation.mutateAsync,
    isCreating: createAssetMutation.isPending,
    updateAsset: updateAssetMutation.mutateAsync,
    isUpdating: updateAssetMutation.isPending,
    deleteAsset: deleteAssetMutation.mutateAsync,
    isDeleting: deleteAssetMutation.isPending,
  };
}

export function useAssetDetail(id: number | string) {
  return useQuery({
    queryKey: ['assets', id],
    queryFn: () => assetService.getAssetById(id),
    enabled: !!id,
  });
}
