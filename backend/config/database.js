const { Pool } = require('pg');

const defaultPreferences = {
  notifications: {
    email: true,
    sms: false,
    push: true,
  },
  language: 'en',
  currency: 'NPR',
  theme: 'light',
};

const defaultPreferencesLiteral = JSON.stringify(defaultPreferences).replace(/'/g, "''");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

const query = (text, params = []) => pool.query(text, params);

const withTransaction = async (callback) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const initializeSchema = async () => {
  await query('CREATE EXTENSION IF NOT EXISTS pgcrypto');

  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      phone TEXT UNIQUE,
      password TEXT,
      google_id TEXT UNIQUE,
      avatar TEXT,
      auth_provider TEXT NOT NULL CHECK (auth_provider IN ('email', 'phone', 'google')),
      role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
      permissions TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
      is_super_admin BOOLEAN NOT NULL DEFAULT FALSE,
      admin_invited_by UUID REFERENCES users(id),
      admin_invited_at TIMESTAMPTZ,
      is_verified BOOLEAN NOT NULL DEFAULT FALSE,
      email_verification_token TEXT,
      email_verification_expires TIMESTAMPTZ,
      password_reset_token TEXT,
      password_reset_expires TIMESTAMPTZ,
      last_login TIMESTAMPTZ,
      login_attempts INTEGER NOT NULL DEFAULT 0,
      lock_until TIMESTAMPTZ,
      preferences JSONB NOT NULL DEFAULT '${defaultPreferencesLiteral}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      location TEXT NOT NULL,
      city TEXT NOT NULL,
      country TEXT NOT NULL,
      ticket_categories JSONB NOT NULL,
      category TEXT NOT NULL,
      image_url TEXT NOT NULL,
      organizer TEXT NOT NULL,
      featured BOOLEAN NOT NULL DEFAULT FALSE,
      coordinates JSONB NOT NULL,
      created_by UUID NOT NULL REFERENCES users(id),
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS vouchers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      code TEXT NOT NULL UNIQUE,
      event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      discount_percentage INTEGER NOT NULL CHECK (discount_percentage BETWEEN 1 AND 100),
      description TEXT NOT NULL DEFAULT '',
      max_uses INTEGER NOT NULL CHECK (max_uses >= 1),
      used_count INTEGER NOT NULL DEFAULT 0 CHECK (used_count >= 0),
      valid_from TIMESTAMPTZ NOT NULL,
      valid_until TIMESTAMPTZ NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_by UUID NOT NULL REFERENCES users(id),
      min_order_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
      max_discount_amount NUMERIC(12,2),
      max_uses_per_user INTEGER NOT NULL DEFAULT 1 CHECK (max_uses_per_user >= 1),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS voucher_usage (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      voucher_id UUID NOT NULL REFERENCES vouchers(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      usage_count INTEGER NOT NULL DEFAULT 1 CHECK (usage_count >= 1),
      used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (voucher_id, user_id)
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS tickets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      ticket_id TEXT NOT NULL UNIQUE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      purchase_id TEXT NOT NULL,
      quantity INTEGER NOT NULL CHECK (quantity >= 1),
      unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
      total_amount NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0),
      original_amount NUMERIC(12,2) NOT NULL CHECK (original_amount >= 0),
      discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
      applied_vouchers JSONB NOT NULL DEFAULT '[]'::jsonb,
      currency TEXT NOT NULL DEFAULT 'NPR',
      payment_method TEXT NOT NULL CHECK (payment_method IN ('card', 'khalti', 'esewa', 'cash')),
      transaction_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pending', 'cancelled', 'refunded')),
      purchase_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      qr_code TEXT NOT NULL UNIQUE,
      seat_numbers JSONB NOT NULL DEFAULT '[]'::jsonb,
      event_details JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS wishlists (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      event_details JSONB NOT NULL,
      added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (user_id, event_id)
    )
  `);
};

const connectDB = async () => {
  try {
    await pool.query('SELECT 1');
    await initializeSchema();
    console.log('PostgreSQL connected');

    process.on('SIGINT', async () => {
      await pool.end();
      console.log('PostgreSQL pool closed through app termination');
      process.exit(0);
    });
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

module.exports = {
  pool,
  query,
  withTransaction,
  connectDB,
  defaultPreferences,
};
