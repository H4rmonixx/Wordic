USE wordic;

DROP TABLE IF EXISTS `WordProgress`;
DROP TABLE IF EXISTS `Word`;
DROP TABLE IF EXISTS `SetMeta`;
DROP TABLE IF EXISTS `Set`;
DROP TABLE IF EXISTS `User`;

CREATE TABLE `User` (
    `user_id` int NOT NULL AUTO_INCREMENT,
    `username` varchar(50) NOT NULL,
    `email` varchar(100) NOT NULL,
    `password` varchar(255) NOT NULL,
    `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`user_id`),
    UNIQUE KEY `username_unique` (`username`),
    UNIQUE KEY `email_unique` (`email`)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Set` (
    `set_id` int NOT NULL AUTO_INCREMENT,
    `user_id` int NOT NULL,
    `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `name` varchar(64) NOT NULL,
    `description` varchar(150) DEFAULT "",
    `public` boolean NOT NULL DEFAULT FALSE,
    `image_name` varchar(255) DEFAULT NULL,
    PRIMARY KEY (`set_id`),
    FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`) ON DELETE CASCADE,
    UNIQUE KEY `name_unique` (`name`)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `SetMeta` (
    `set_id` int NOT NULL,
    `user_id` int NOT NULL,
    `last_played` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `track_progress` boolean NOT NULL DEFAULT TRUE,
    PRIMARY KEY (`set_id`, `user_id`),
    FOREIGN KEY (`set_id`) REFERENCES `Set` (`set_id`) ON DELETE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`) ON DELETE CASCADE
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Word` (
    `word_id` int NOT NULL AUTO_INCREMENT,
    `set_id` int NOT NULL,
    `term` varchar(100) NOT NULL,
    `definition` varchar(100) NOT NULL,
    PRIMARY KEY (`word_id`),
    FOREIGN KEY (`set_id`) REFERENCES `Set` (`set_id`) ON DELETE CASCADE,
    UNIQUE KEY `term_definition_unique` (`term`, `definition`)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `WordProgress` (
    `user_id` int NOT NULL,
    `word_id` int NOT NULL,
    `repetition` int NOT NULL DEFAULT 0,
    `next_review` datetime NOT NULL,
    PRIMARY KEY (`user_id`, `word_id`),
    FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`) ON DELETE CASCADE,
    FOREIGN KEY (`word_id`) REFERENCES `Word` (`word_id`) ON DELETE CASCADE
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;