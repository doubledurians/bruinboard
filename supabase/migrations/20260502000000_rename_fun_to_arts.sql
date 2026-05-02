ALTER TABLE events DROP CONSTRAINT IF EXISTS events_category_check;
ALTER TABLE events ADD CONSTRAINT events_category_check
  CHECK (category IN ('academic', 'popup', 'arts', 'workshops'));
UPDATE events SET category = 'arts' WHERE category = 'fun';
