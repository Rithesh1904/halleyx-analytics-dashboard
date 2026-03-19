import { Pool } from 'pg';
import { QueryBuilder } from '../utils/queryBuilder';

export class AnalyticsService {
  constructor(private db: Pool) {}

  async executeQuery(config: any) {
    const { query, params } = QueryBuilder.build(config);
    const result = await this.db.query(query, params);
    return result.rows;
  }

  async getWidgetData(widgetId: string) {
    const widgetRes = await this.db.query("SELECT * FROM widgets WHERE id = $1", [widgetId]);
    const widget = widgetRes.rows[0];
    if (!widget) throw new Error("Widget not found");
    
    const config = typeof widget.config === 'string' ? JSON.parse(widget.config) : widget.config;
    return this.executeQuery({
      ...config,
      type: widget.type
    });
  }
}
