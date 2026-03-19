export class QueryBuilder {
  private static readonly ALLOWED_FIELDS = [
    'id', 'category', 'product', 'status', 'created_by', 'customer_name', 
    'total_amount', 'quantity', 'unit_price', 'created_at',
    'first_name', 'last_name', 'email', 'phone', 'address', 'city', 'state', 'postal_code', 'country', 'created_by_name'
  ];
  private static readonly ALLOWED_AGGS = ['sum', 'avg', 'count', 'min', 'max'];
  private static readonly ALLOWED_OPS = ['=', '!=', '>', '<', '>=', '<=', 'LIKE', 'IN'];

  static build(config: {
    type?: string;
    dimension?: string;
    metric?: string;
    aggregation?: string;
    filters?: any[];
    dateFilter?: string;
    statusFilter?: string;
    categoryFilter?: string;
    productFilter?: string;
    limit?: number;
    offset?: number;
    sort?: { field: string; order: 'asc' | 'desc' };
    columns?: string[];
  }) {
    const params: any[] = [];
    let select = "";
    let groupBy = "";
    let orderBy = "";
    let where = "WHERE 1=1";

    const type = config.type || 'bar';

    // 1. SELECT & GROUP BY logic based on Widget Type
    if (type === 'kpi') {
      const met = config.metric || 'total_amount';
      const agg = (config.aggregation || 'sum').toLowerCase();
      if (!this.ALLOWED_FIELDS.includes(met) || !this.ALLOWED_AGGS.includes(agg)) throw new Error("Invalid KPI config");
      select = `SELECT ${agg}(${met}) as value`;
    } else if (type === 'table') {
      const cols = config.columns || ['customer_name', 'category', 'product', 'quantity', 'total_amount', 'status'];
      const validCols = cols.filter(c => this.ALLOWED_FIELDS.includes(c));
      select = `SELECT ${validCols.join(', ')}`;
    } else {
      // Charts (Bar, Line, Area, Pie, Scatter)
      const dim = config.dimension || 'category';
      const met = config.metric || 'total_amount';
      const agg = (config.aggregation || 'sum').toLowerCase();

      if (!this.ALLOWED_FIELDS.includes(dim) || !this.ALLOWED_FIELDS.includes(met) || !this.ALLOWED_AGGS.includes(agg)) {
        throw new Error("Invalid chart config");
      }

      select = `SELECT ${dim} as label, ${agg}(${met}) as value`;
      groupBy = `GROUP BY ${dim}`;
      orderBy = `ORDER BY value DESC`;
    }

    // 2. DATE FILTER (Today, 7, 30, 90)
    if (config.dateFilter && config.dateFilter !== 'all') {
      if (config.dateFilter === 'today') {
        where += ` AND created_at::date = CURRENT_DATE`;
      } else {
        let days = 0;
        if (config.dateFilter === '7d') days = 7;
        else if (config.dateFilter === '30d') days = 30;
        else if (config.dateFilter === '90d') days = 90;
        else if (config.dateFilter === '365d') days = 365;
        else days = parseInt(config.dateFilter);

        if (!isNaN(days) && days > 0) {
          where += ` AND created_at >= NOW() - INTERVAL '${days} days'`;
        }
      }
    }

    // 3. CUSTOM FILTERS
    if (config.statusFilter && config.statusFilter !== 'all') {
      params.push(config.statusFilter);
      where += ` AND status = $${params.length}`;
    }

    if (config.categoryFilter && config.categoryFilter !== 'all') {
      params.push(config.categoryFilter);
      where += ` AND category = $${params.length}`;
    }

    if (config.productFilter && config.productFilter !== 'all') {
      params.push(config.productFilter);
      where += ` AND product = $${params.length}`;
    }

    if (config.filters) {
      config.filters.forEach((f: any) => {
        if (this.ALLOWED_FIELDS.includes(f.field) && this.ALLOWED_OPS.includes(f.operator)) {
          params.push(f.value);
          where += ` AND ${f.field} ${f.operator} $${params.length}`;
        }
      });
    }

    // 4. SORTING
    if (config.sort && this.ALLOWED_FIELDS.includes(config.sort.field)) {
      orderBy = `ORDER BY ${config.sort.field} ${config.sort.order.toUpperCase()}`;
    }

    const query = `
      ${select}
      FROM orders
      ${where}
      ${groupBy}
      ${orderBy}
      LIMIT ${config.limit || 100}
      OFFSET ${config.offset || 0}
    `;

    return { query, params };
  }
}
