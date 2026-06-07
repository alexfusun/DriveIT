CREATE TABLE IF NOT EXISTS cars (
    id BIGSERIAL PRIMARY KEY,
    brand_id BIGINT NOT NULL REFERENCES brands(id),
    model_id BIGINT NOT NULL REFERENCES car_models(id),
    version VARCHAR(150) NOT NULL,
    year INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(500),
    average_rating DECIMAL (3,2) NOT NULL DEFAULT 0,
    review_count INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS car_specs (
    car_id BIGINT PRIMARY KEY REFERENCES cars(id) ON DELETE CASCADE,
    displacement INT,
    horsepower INT,
    torque INT,
    fuel_type VARCHAR(20) NOT NULL,
    cylinders INT,
    consumption DECIMAL (5,2),
    emissions INT,
    length INT,
    width INT,
    height INT,
    wheelbase INT,
    trunk_capacity INT,
    acceleration_0_to_100 DECIMAL (4,1),
    top_speed INT,
    transmission VARCHAR(20) NOT NULL,
    drivetrain VARCHAR(10),
    doors INT,
    seats INT
);

CREATE TABLE IF NOT EXISTS car_images (
    id BIGSERIAL PRIMARY KEY,
    car_id BIGINT NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    position INT NOT NULL DEFAULT 0
);