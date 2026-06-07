CREATE TABLE IF NOT EXISTS brands (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    country VARCHAR(100),
    logo_url VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS car_models (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    brand_id BIGINT NOT NULL REFERENCES brands(id),
    UNIQUE(brand_id, name)
);