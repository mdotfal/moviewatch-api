CREATE TABLE moviewatch_items (
  id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  title TEXT NOT NULL,
  is_netflix BOOLEAN NOT NULL,
  is_hulu BOOLEAN NOT NULL,
  is_prime BOOLEAN NOT NULL,
  rating TEXT NOT NULL
);