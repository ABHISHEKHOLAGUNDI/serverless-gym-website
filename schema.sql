DROP TABLE IF EXISTS members;
CREATE TABLE members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  photo TEXT, -- Base64 or URL
  plan_type TEXT, -- Monthly, Quarterly, Yearly
  amount REAL,
  start_date DATE DEFAULT (DATE('now')),
  end_date DATE,
  status TEXT DEFAULT 'active' -- active, expired, inactive
);

DROP TABLE IF EXISTS staff;
CREATE TABLE staff (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  salary REAL
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
  type TEXT NOT NULL, -- income, expense
  amount REAL NOT NULL,
  date DATE DEFAULT (DATE('now')),
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

DROP TABLE IF EXISTS diet_plans;
CREATE TABLE diet_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id INTEGER NOT NULL,
  plan_details TEXT,
  assigned_date DATE DEFAULT (DATE('now')),
  FOREIGN KEY (member_id) REFERENCES members(id)
);
