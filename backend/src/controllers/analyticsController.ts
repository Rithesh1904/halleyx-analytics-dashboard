import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analyticsService';

export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  async query(req: Request, res: Response) {
    try {
      const results = await this.analyticsService.executeQuery(req.body);
      res.json(results);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getWidgetAnalytics(req: Request, res: Response) {
    try {
      const results = await this.analyticsService.getWidgetData(req.params.id);
      res.json(results);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
