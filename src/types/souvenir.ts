import { User } from './api';

export interface SouvenirName {
  id: number;
  name: string;
  description?: string;
  souvenirs_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Souvenir {
  id: number;
  souvenir_name_id: number;
  qty: number;
  initial_qty: number;
  description?: string;
  image?: string;
  image_url?: string;
  souvenir_name?: SouvenirName;
  souvenirName?: SouvenirName;
  created_at?: string;
  updated_at?: string;
}

export interface SouvenirStockAddition {
  id: number;
  souvenir_id: number;
  qty: number;
  date: string;
  notes?: string;
  created_by?: number;
  creator?: User;
  souvenir?: Souvenir;
  created_at?: string;
  updated_at?: string;
}

export type TransactionStatus = 'open' | 'closed';
export type ReturnLocation = 'brought_back' | 'left_at_venue' | 'other';

export interface SouvenirTransaction {
  id: number;
  souvenir_id: number;
  training_name: string;
  pic: string;
  qty_out: number;
  qty_actual?: number;
  date_out: string;
  return_location?: ReturnLocation;
  return_notes?: string;
  photo?: string;
  photo_url?: string;
  status: TransactionStatus;
  notes?: string;
  created_by?: number;
  recalled_at?: string;
  recalled_by?: number;
  creator?: User;
  souvenir?: Souvenir;
  created_at?: string;
  updated_at?: string;
}
