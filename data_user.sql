INSERT INTO
    `users` (
        `username`,
        `email`,
        `password`,
        `phone`,
        `instansi`,
        `role`,
        `approved`,
        `createdAt`,
        `updatedAt`
    )
VALUES
    (
        'Maura',
        'maura@gmail.com',
        'maura',
        '-',
        'Politeknik KP Sidoarjo',
        'user',
        1,
        '2025-05-14 00:00:00',
        NOW()
    );