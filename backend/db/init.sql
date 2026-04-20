CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    age INTEGER,
    weight DECIMAL(5, 2), -- kg
    height DECIMAL(5, 2), -- cm
    bmr DECIMAL(7, 2),
    tdee DECIMAL(7, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS food_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    food_name VARCHAR(255) NOT NULL,
    calories INTEGER,
    macronutrients JSONB, -- { "protein": 10, "carbs": 20, "fat": 5 }
    image_url TEXT,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS water_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    amount_ml INTEGER NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
