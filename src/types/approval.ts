import { User, Asset } from './api';
import { PengadaanPriority } from './pengadaan';

export type PendingStatus = 'pending' | 'approved' | 'rejected';

export interface AssetPending {
  id: number;
  user_id: number;
  name: string;
  image?: string;
  image_url?: string;
  asset?: string;
  no_asset?: string;
  location?: string;
  building?: string;
  category?: string;
  sub_category?: string;
  merk?: string;
  size?: string;
  unit?: string;
  status: string;
  last_maintenance?: string;
  next_maintenance?: string;
  remarks?: string;
  reviewed_by?: number;
  reviewed_at?: string;
  reject_reason?: string;
  user?: User;
  reviewer?: User;
  created_at?: string;
  updated_at?: string;
}

export interface PengadaanAssetPending {
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
  status: PendingStatus;
  reviewed_by?: number;
  reviewed_at?: string;
  reject_reason?: string;
  user?: User;
  reviewer?: User;
  created_at?: string;
  updated_at?: string;
}

export interface BorrowPending {
  id: number;
  user_id: number;
  asset_id: number;
  remark?: string;
  status: PendingStatus;
  reviewed_by?: number;
  reviewed_at?: string;
  reject_reason?: string;
  user?: User;
  asset?: Asset;
  reviewer?: User;
  created_at?: string;
  updated_at?: string;
}

export interface MaintenancePending {
  id: number;
  user_id: number;
  asset_id: number;
  type?: string;
  remark?: string;
  status: PendingStatus;
  reviewed_by?: number;
  reviewed_at?: string;
  user?: User;
  asset?: Asset;
  reviewer?: User;
  created_at?: string;
  updated_at?: string;
}
