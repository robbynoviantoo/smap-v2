export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
    from?: number;
    to?: number;
  };
  errors?: Record<string, string[]>;
}

export interface User {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  no_handphone?: string;
  bio?: string;
  avatar?: string;
  avatar_url?: string;
  image?: string;
  image_url?: string;
  negara?: string;
  kota?: string;
  kodepos?: string;
  alamat?: string;
  is_first_login?: boolean;
  roles?: Array<{ id: number; name: string }>;
  permissions?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface LoginResponse {
  token: string;
  token_type: string;
  user: User;
}

export interface Asset {
  id: number;
  name: string;
  no_asset?: string;
  asset?: string;
  category?: string;
  sub_category?: string;
  merk?: string;
  location?: string;
  building?: string;
  unit?: string;
  status: 'good' | 'maintenance' | 'broken' | string;
  available_status: 'available' | 'borrowed' | string;
  photo?: string;
  photo_url?: string;
  images?: string[];
  remarks?: string;
  last_maintenance?: string;
  next_maintenance?: string;
  created_at?: string;
  updated_at?: string;
}
