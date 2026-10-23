import { User, Asset } from './api';

export type PengadaanProgress = 'pre_order' | 'on_process' | 'arrived' | 'finished';
export type PengadaanPriority = 'low' | 'normal' | 'high' | 'urgent';
export type DeliveryDisposition = 'pending' | 'asset' | 'consumable';

export interface PengadaanAssetDelivery {
  id: number;
  request_asset_id: number;
  qty_delivery: number;
  photo?: string;
  photo_url?: string;
  note?: string;
  delivered_at?: string;
  qty_retur?: number;
  retur_reason?: string;
  retur_photo?: string;
  retur_photo_url?: string;
  retured_at?: string;
  disposition?: DeliveryDisposition;
  asset_qty?: number;
  converted_at?: string;
  created_by?: number;
  converted_by?: number;
  creator?: User;
  converter?: User;
  assets?: Asset[];
  created_at?: string;
  updated_at?: string;
}

export interface PengadaanAsset {
  id: number;
  user_id: number;
  request_date: string;
  category: string;
  name: string;
  merk?: string;
  spec?: string;
  qty: number;
  unit: string;
  image?: string;
  image_url?: string;
  remark?: string;
  priority: PengadaanPriority;
  progress: PengadaanProgress;
  qty_received: number;
  finished_at?: string;
  user?: User;
  deliveries?: PengadaanAssetDelivery[];
  created_at?: string;
  updated_at?: string;
}

export interface PengadaanFilterParams {
  per_page?: number;
  page?: number;
  q?: string;
  progress?: string;
  priority?: string;
}
