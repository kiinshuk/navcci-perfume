-- Extensions commonly used in ecommerce
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS citext;

-- Text search configuration that supports trigrams + accent-insensitivity
-- (used by Django full-text search on product names/descriptions)
CREATE TEXT SEARCH CONFIGURATION luxe_unaccent (COPY = simple);
ALTER TEXT SEARCH CONFIGURATION luxe_unaccent ALTER MAPPING FOR hword, hword_part, word WITH simple, unaccent, english_stem;
