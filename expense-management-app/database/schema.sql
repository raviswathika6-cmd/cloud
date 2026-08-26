-- Expense Management Application - PostgreSQL Schema

-- USERS TABLE
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_active BOOLEAN DEFAULT true,
  is_email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- EXPENSE CATEGORIES TABLE
CREATE TABLE expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- EXPENSES TABLE
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES expense_categories(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  expense_date DATE NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'cash',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'reimbursed')),
  receipt_url VARCHAR(500),
  receipt_file_name VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_category_id ON expenses(category_id);
CREATE INDEX idx_expenses_status ON expenses(status);
CREATE INDEX idx_expenses_expense_date ON expenses(expense_date);
CREATE INDEX idx_expenses_created_at ON expenses(created_at);

-- PAYMENTS TABLE
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  stripe_payment_id VARCHAR(255) UNIQUE,
  stripe_charge_id VARCHAR(255),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'refunded')),
  payment_method VARCHAR(50),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_expense_id ON payments(expense_id);
CREATE INDEX idx_payments_stripe_payment_id ON payments(stripe_payment_id);
CREATE INDEX idx_payments_status ON payments(status);

-- WEBHOOKS TABLE
CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(100) NOT NULL,
  external_id VARCHAR(255),
  payload JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'received' CHECK (status IN ('received', 'processed', 'failed')),
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP
);

CREATE INDEX idx_webhooks_event_type ON webhooks(event_type);
CREATE INDEX idx_webhooks_status ON webhooks(status);
CREATE INDEX idx_webhooks_external_id ON webhooks(external_id);

-- AUDIT LOG TABLE
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100),
  entity_id VARCHAR(255),
  changes JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- EXPENSE SUMMARIES TABLE
CREATE TABLE expense_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_expenses DECIMAL(10, 2),
  category_breakdown JSONB,
  ai_summary TEXT,
  insights JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_summaries_user_id ON expense_summaries(user_id);
CREATE INDEX idx_summaries_period ON expense_summaries(period_start, period_end);

-- Initial expense categories
INSERT INTO expense_categories (name, description, icon) VALUES
  ('Food & Dining', 'Meals, restaurants, groceries', '🍽️'),
  ('Transportation', 'Gas, taxi, public transport', '🚗'),
  ('Utilities', 'Electricity, water, internet', '💡'),
  ('Entertainment', 'Movies, events, subscriptions', '🎬'),
  ('Shopping', 'Retail, clothing, accessories', '🛍️'),
  ('Health & Wellness', 'Medical, gym, wellness', '⚕️'),
  ('Travel', 'Hotels, flights, vacation', '✈️'),
  ('Business', 'Office supplies, equipment', '💼'),
  ('Subscriptions', 'Software, apps, memberships', '📱'),
  ('Other', 'Miscellaneous expenses', '📌')
ON CONFLICT DO NOTHING;
