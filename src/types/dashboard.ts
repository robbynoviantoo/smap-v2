export interface DashboardSummary {
  total_assets: number;
  status_counts: {
    good: number;
    maintenance: number;
    broken: number;
  };
  available_counts: {
    available: number;
    borrowed: number;
  };
  pending_counts: {
    total: number;
    breakdown: {
      asset: number;
      pengadaan: number;
      maintenance: number;
      borrow: number;
    };
  };
}

export interface MaintenanceForecastItem {
  month: string;
  count: number;
}

export interface AssetAdditionItem {
  month: string;
  count: number;
}

export interface DashboardStats {
  maintenance_forecast: MaintenanceForecastItem[];
  asset_additions: AssetAdditionItem[];
  status_distribution: {
    Good: number;
    Maintenance: number;
    Broken: number;
  };
}
