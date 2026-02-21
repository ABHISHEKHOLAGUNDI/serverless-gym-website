DROP TABLE IF EXISTS members;
CREATE TABLE members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  photo TEXT, -- Base64 or URL (compressed to ~20KB)
  height REAL, -- Height in cm (used for BMI calculation)
  plan_type TEXT, -- Monthly, Quarterly, Yearly
  amount REAL,
  start_date DATE DEFAULT (DATE('now')),
  expiry_date DATE, -- End date auto-calculated from plan type
  dob DATE, -- For Birthday feature
  trainer_id INTEGER, -- Assigned trainer
  status TEXT DEFAULT 'active', -- active, expired, inactive
  FOREIGN KEY (trainer_id) REFERENCES trainers(id)
);

DROP TABLE IF EXISTS trainers;
CREATE TABLE trainers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  specialty TEXT,
  phone TEXT
);

DROP TABLE IF EXISTS machines;
CREATE TABLE machines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  status TEXT, -- Operational, Under Maintenance
  last_maintenance DATE,
  next_maintenance DATE
);

DROP TABLE IF EXISTS attendance;
CREATE TABLE attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id INTEGER NOT NULL,
  date DATE DEFAULT (DATE('now')),
  status TEXT, -- present, absent
  FOREIGN KEY (member_id) REFERENCES members(id)
);

DROP TABLE IF EXISTS finances;
CREATE TABLE finances (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL, -- Income, Expense
  amount REAL NOT NULL,
  date DATE DEFAULT (DATE('now')),
  category TEXT,
  description TEXT
);

DROP TABLE IF EXISTS measurements;
CREATE TABLE measurements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id INTEGER NOT NULL,
  date DATE DEFAULT (DATE('now')),
  weight REAL,
  chest REAL,
  biceps_l REAL, -- Left Bicep
  biceps_r REAL, -- Right Bicep
  waist REAL,
  thigh REAL,
  calves REAL,
  FOREIGN KEY (member_id) REFERENCES members(id)
);
