import { Router } from 'express';
import { Pool } from 'pg';
import { AnalyticsController } from '../controllers/analyticsController';
import { AnalyticsService } from '../services/analyticsService';

export const createApiRouter = (pool: Pool) => {
  const router = Router();
  const analyticsService = new AnalyticsService(pool);
  const analyticsController = new AnalyticsController(analyticsService);

  const checkDb = (req: any, res: any, next: any) => {
    if (!process.env.DATABASE_URL) {
      return res.status(503).json({ error: "Database not configured. Please set DATABASE_URL in secrets." });
    }
    next();
  };

  // Orders API
  router.get("/orders", checkDb, async (req, res) => {
    const result = await pool.query(`
      SELECT * FROM orders ORDER BY created_at DESC
    `);
    res.json(result.rows);
  });

  router.post("/orders", checkDb, async (req, res) => {
    const { 
      customer_name, first_name, last_name, email, phone, address, city, state, postal_code, country,
      category, product, status, quantity, unit_price, created_by, created_by_name 
    } = req.body;
    const total_amount = quantity * unit_price;
    const result = await pool.query(
      `INSERT INTO orders (
        customer_name, first_name, last_name, email, phone, address, city, state, postal_code, country,
        category, product, status, quantity, unit_price, total_amount, created_by, created_by_name
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) RETURNING *`,
      [
        customer_name, first_name, last_name, email, phone, address, city, state, postal_code, country,
        category || 'Electronics', product, status, quantity, unit_price, total_amount, created_by, created_by_name
      ]
    );
    res.json(result.rows[0]);
  });

  router.put("/orders/:id", checkDb, async (req, res) => {
    const { 
      customer_name, first_name, last_name, email, phone, address, city, state, postal_code, country,
      category, product, status, quantity, unit_price, created_by_name 
    } = req.body;
    const total_amount = quantity * unit_price;
    await pool.query(
      `UPDATE orders SET 
        customer_name = $1, first_name = $2, last_name = $3, email = $4, phone = $5, address = $6, 
        city = $7, state = $8, postal_code = $9, country = $10, category = $11, product = $12, 
        status = $13, quantity = $14, unit_price = $15, total_amount = $16, created_by_name = $17, 
        updated_at = NOW() WHERE id = $18`,
      [
        customer_name, first_name, last_name, email, phone, address, city, state, postal_code, country,
        category, product, status, quantity, unit_price, total_amount, created_by_name, req.params.id
      ]
    );
    res.json({ success: true });
  });

  router.delete("/orders/:id", checkDb, async (req, res) => {
    await pool.query("DELETE FROM orders WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  });

  router.post("/orders/clear", checkDb, async (req, res) => {
    await pool.query("DELETE FROM orders");
    res.json({ success: true });
  });

  // Dashboards API
  router.get("/dashboards", checkDb, async (req, res) => {
    const result = await pool.query("SELECT * FROM dashboards ORDER BY created_at DESC");
    res.json(result.rows);
  });

  router.get("/dashboards/:id", checkDb, async (req, res) => {
    const dash = await pool.query("SELECT * FROM dashboards WHERE id = $1", [req.params.id]);
    const widgets = await pool.query("SELECT * FROM widgets WHERE dashboard_id = $1", [req.params.id]);
    res.json({ ...dash.rows[0], widgets: widgets.rows });
  });

  router.post("/dashboards", checkDb, async (req, res) => {
    const { name, created_by } = req.body;
    const result = await pool.query("INSERT INTO dashboards (name, created_by) VALUES ($1, $2) RETURNING *", [name, created_by]);
    res.json(result.rows[0]);
  });

  router.delete("/dashboards/:id", checkDb, async (req, res) => {
    await pool.query("DELETE FROM dashboards WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  });

  router.put("/dashboards/:id/widgets", checkDb, async (req, res) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query("DELETE FROM widgets WHERE dashboard_id = $1", [req.params.id]);
      
      const widgets = req.body.widgets;
      for (const w of widgets) {
        await client.query(
          "INSERT INTO widgets (id, dashboard_id, type, config, layout_x, layout_y, layout_w, layout_h) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
          [w.id, req.params.id, w.type, w.config, w.layout_x, w.layout_y, w.layout_w, w.layout_h]
        );
      }
      
      await client.query('COMMIT');
      res.json({ success: true });
    } catch (e) {
      await client.query('ROLLBACK');
      res.status(500).json({ error: "Failed to save widgets" });
    } finally {
      client.release();
    }
  });

  // Widgets API
  router.post("/widgets", checkDb, async (req, res) => {
    const { id, dashboard_id, type, config, layout_x, layout_y, layout_w, layout_h } = req.body;
    let result;
    if (id) {
      result = await pool.query(
        "INSERT INTO widgets (id, dashboard_id, type, config, layout_x, layout_y, layout_w, layout_h) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
        [id, dashboard_id, type, config, layout_x, layout_y, layout_w, layout_h]
      );
    } else {
      result = await pool.query(
        "INSERT INTO widgets (dashboard_id, type, config, layout_x, layout_y, layout_w, layout_h) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
        [dashboard_id, type, config, layout_x, layout_y, layout_w, layout_h]
      );
    }
    res.json(result.rows[0]);
  });

  router.put("/widgets/:id", checkDb, async (req, res) => {
    const { type, config, layout_x, layout_y, layout_w, layout_h } = req.body;
    await pool.query(
      "UPDATE widgets SET type = COALESCE($1, type), config = $2, layout_x = $3, layout_y = $4, layout_w = $5, layout_h = $6, updated_at = NOW() WHERE id = $7",
      [type, config, layout_x, layout_y, layout_w, layout_h, req.params.id]
    );
    res.json({ success: true });
  });

  router.delete("/widgets/:id", checkDb, async (req, res) => {
    await pool.query("DELETE FROM widgets WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  });

  // Analytics API
  router.post("/analytics/query", checkDb, (req, res) => analyticsController.query(req, res));
  router.get("/analytics/widget/:id", checkDb, (req, res) => analyticsController.getWidgetAnalytics(req, res));

  return router;
};
