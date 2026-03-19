export interface Order {
  id: string;
  customer_name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  category: string;
  product: string;
  status: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  created_by_name?: string;
  created_at: string;
}

export interface WidgetConfig {
  id: string;
  type: 'bar' | 'line' | 'area' | 'scatter' | 'pie' | 'kpi' | 'table';
  title: string;
  dimension: string;
  metric: string;
  aggregation: 'sum' | 'count' | 'avg' | 'min' | 'max';
  dateFilter: 'all' | 'today' | '7d' | '30d' | '90d' | '365d';
  statusFilter?: string;
  categoryFilter?: string;
  productFilter?: string;
  colSpan?: number;
  height?: number;
}

export interface Dashboard {
  id: number;
  name: string;
  layout: any[];
  widgets: Record<string, WidgetConfig>;
}
