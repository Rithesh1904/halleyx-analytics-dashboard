import 'dotenv/config';
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { Pool } from "pg";
import { createApiRouter } from "./src/routes/api";

async function startServer() {
  const app = express();
  const PORT = 3006;

  app.use(express.json());

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  let dbStatus = { connected: false, error: null as string | null };

  // Initialize Database
  const initDb = async () => {
    if (!process.env.DATABASE_URL) {
      dbStatus.error = "DATABASE_URL secret is missing.";
      return;
    }
    try {
      const client = await pool.connect();
      console.log("Successfully connected to the database");
      client.release();

      await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
      
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS orders (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          customer_name TEXT NOT NULL,
          first_name TEXT,
          last_name TEXT,
          email TEXT,
          phone TEXT,
          address TEXT,
          city TEXT,
          state TEXT,
          postal_code TEXT,
          country TEXT,
          category TEXT NOT NULL DEFAULT 'Electronics',
          product TEXT NOT NULL,
          status TEXT NOT NULL,
          quantity INTEGER NOT NULL,
          unit_price NUMERIC NOT NULL,
          total_amount NUMERIC NOT NULL,
          created_by_name TEXT,
          created_by UUID REFERENCES users(id),
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS dashboards (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name TEXT NOT NULL,
          created_by UUID REFERENCES users(id),
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS widgets (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          dashboard_id UUID REFERENCES dashboards(id) ON DELETE CASCADE,
          type TEXT NOT NULL,
          config JSONB NOT NULL,
          layout_x INTEGER NOT NULL,
          layout_y INTEGER NOT NULL,
          layout_w INTEGER NOT NULL,
          layout_h INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);

      // Migration: Add new columns if they don't exist
      await pool.query(`
        DO $$ 
        BEGIN 
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='category') THEN 
            ALTER TABLE orders ADD COLUMN category TEXT NOT NULL DEFAULT 'Electronics';
          END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='first_name') THEN 
            ALTER TABLE orders ADD COLUMN first_name TEXT;
            ALTER TABLE orders ADD COLUMN last_name TEXT;
            ALTER TABLE orders ADD COLUMN email TEXT;
            ALTER TABLE orders ADD COLUMN phone TEXT;
            ALTER TABLE orders ADD COLUMN address TEXT;
            ALTER TABLE orders ADD COLUMN city TEXT;
            ALTER TABLE orders ADD COLUMN state TEXT;
            ALTER TABLE orders ADD COLUMN postal_code TEXT;
            ALTER TABLE orders ADD COLUMN country TEXT;
            ALTER TABLE orders ADD COLUMN created_by_name TEXT;
          END IF;
        END $$;
      `);

      // Seed a default user if none exists
      const userCheck = await pool.query("SELECT * FROM users LIMIT 1");
      if (userCheck.rows.length === 0) {
        await pool.query(
          "INSERT INTO users (name, email) VALUES ($1, $2)",
          ["Demo User", "demo@example.com"]
        );
      }

      // Cleanup sample data if requested (one-time or persistent)
      // We remove orders that match the seeding pattern: "Customer X"
      await pool.query("DELETE FROM orders WHERE customer_name LIKE 'Customer %'");
      
      console.log("Database initialized successfully");
      dbStatus.connected = true;
    } catch (err: any) {
      console.error("Database initialization failed:", err);
      dbStatus.error = err.message || String(err);
      dbStatus.connected = false;
    }
  };

  await initDb();

  // API Routes
  app.get("/api/db-status", (req, res) => {
    res.json(dbStatus);
  });

  app.use("/api", createApiRouter(pool));

  // Vite middleware for development
  // Always serve static files from the 'dist' directory
    const distPath = path.join(process.cwd(), 'frontend/dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log("Server running on http://localhost:" + PORT);
  });
}

startServer();
