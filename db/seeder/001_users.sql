INSERT INTO coffee_users (
    email,
    name,
    password_hash,
    role
)
VALUES
(
    'admin@gmail.cafe',
    'Administrator',
    crypt('password', gen_salt('bf', 10)),
    'admin'
),
(
    'editor@gmail.cafe',
    'Content Editor',
    crypt('password', gen_salt('bf', 10)),
    'editor'
)
ON CONFLICT (email)
DO NOTHING;