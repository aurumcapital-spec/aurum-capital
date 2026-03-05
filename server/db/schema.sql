CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(100) UNIQUE NOT NULL,
  password   VARCHAR(255) NOT NULL,
  balance    DECIMAL(15,2) DEFAULT 0,
  profit     DECIMAL(15,2) DEFAULT 0,
  plan       VARCHAR(50)  DEFAULT 'Bronze',
  role       VARCHAR(20)  DEFAULT 'user',
  status     VARCHAR(20)  DEFAULT 'active',
  country    VARCHAR(100),
  phone      VARCHAR(30),
  created_at TIMESTAMP    DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS plans (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(50)   NOT NULL,
  roi_percent DECIMAL(5,2)  NOT NULL,
  duration    INT           NOT NULL,
  min_amount  DECIMAL(15,2) NOT NULL,
  max_amount  DECIMAL(15,2) NOT NULL,
  active      BOOLEAN       DEFAULT true,
  created_at  TIMESTAMP     DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS transactions (
  id         SERIAL PRIMARY KEY,
  user_id    INT REFERENCES users(id) ON DELETE CASCADE,
  type       VARCHAR(20)   NOT NULL,
  amount     DECIMAL(15,2) NOT NULL,
  method     VARCHAR(50),
  status     VARCHAR(20)   DEFAULT 'pending',
  note       TEXT,
  created_at TIMESTAMP     DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS investments (
  id         SERIAL PRIMARY KEY,
  user_id    INT REFERENCES users(id) ON DELETE CASCADE,
  plan_id    INT REFERENCES plans(id),
  amount     DECIMAL(15,2) NOT NULL,
  start_date DATE          NOT NULL,
  end_date   DATE          NOT NULL,
  status     VARCHAR(20)   DEFAULT 'active'
);
INSERT INTO plans (name,roi_percent,duration,min_amount,max_amount) VALUES
  ('Bronze',    5,  30,    500,   4999),
  ('Silver',    8,  60,   5000,  24999),
  ('Gold',     12,  90,  25000,  99999),
  ('Platinum', 18, 180, 100000, 999999)
ON CONFLICT DO NOTHING;
