DROP DATABASE IF EXISTS mango;
CREATE DATABASE mango;
CREATE USER leo WITH PASSWORD 'password';
ALTER ROLE leo SET client_encoding TO 'utf8';
ALTER ROLE leo SET default_transaction_isolation TO 'read committed';
ALTER ROLE leo SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE mango TO leo;
