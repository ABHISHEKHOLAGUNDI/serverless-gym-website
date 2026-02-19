DROP TABLE IF EXISTS members;
CREATE TABLE members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  photo TEXT, -- Base64 or URL
  plan_type TEXT, -- Monthly, Quarterly, Yearly
  amount REAL,
  start_date DATE DEFAULT (DATE('now')),
  expiry_date DATE, -- Changed from end_date to match API
  dob DATE, -- For Birthday feature
  status TEXT DEFAULT 'active' -- active, expired, inactive
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
  body_fat REAL,
  muscle_mass REAL,
  FOREIGN KEY (member_id) REFERENCES members(id)
);
