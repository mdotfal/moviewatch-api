CREATE TABLE moviewatch_items (
  id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  title TEXT NOT NULL,
  isNetflix BOOLEAN NOT NULL,
  isHulu BOOLEAN NOT NULL,
  isPrime BOOLEAN NOT NULL,
  rating TEXT NOT NULL
);