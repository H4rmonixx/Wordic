USE wordic;

INSERT INTO `User` (`username`, `email`, `password`, `created_at`) VALUES
('H4rmonixx', 'harmonixxgames@gmail.com', '$2y$10$cO2.vD9lZBzbgIWDCA.oO.LxyL9yoqVK8hrqO5T3FesZFGhZnTphy', '2024-06-10 12:00:00');

INSERT INTO `Set` (`user_id`, `created_at`, `name`, `description`) VALUES
(1, '2024-06-10 12:05:00', 'Spanish Basics', 'Basic Spanish vocabulary for beginners.'),
(1, '2024-06-10 12:10:00', 'French Basics', 'Basic French vocabulary for beginners.'),
(1, '2024-06-10 12:15:00', 'German Basics', 'Basic German vocabulary for beginners.');

INSERT INTO `Word` (`set_id`, `term`, `definition`) VALUES
(1, "Hola", "Hello"),
(1, "Adiós", "Goodbye"),
(1, 'Por favor', 'Please'),
(1, 'Gracias', 'Thank you'),
(1, 'Sí', 'Yes'),
(1, 'No', 'No'),
(2, 'Bonjour', 'Hello'),
(2, 'Au revoir', 'Goodbye'),
(2, 'Merci', 'Thank you'),
(2, 'Oui', 'Yes'),
(2, 'Non', 'No'),
(3, 'Hallo', 'Hello'),
(3, 'Tschüss', 'Goodbye'),
(3, 'Bitte', 'Please'),
(3, 'Danke', 'Thank you'),
(3, 'Ja', 'Yes'),
(3, 'Nein', 'No');