-- ===================================================
-- TRIBE OF RAISE PH — MySQL Database Schema
-- Version 1.0.0 | Engine: InnoDB | Charset: utf8mb4
-- ===================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

CREATE DATABASE IF NOT EXISTS `tribe_of_raise_ph`
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `tribe_of_raise_ph`;

-- ===================================================
-- USERS
-- ===================================================
CREATE TABLE `users` (
  `id`            INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `username`      VARCHAR(20)      NOT NULL UNIQUE,
  `email`         VARCHAR(255)     NOT NULL UNIQUE,
  `password_hash` VARCHAR(255)     NOT NULL,
  `level`         SMALLINT         NOT NULL DEFAULT 1,
  `xp`            INT UNSIGNED     NOT NULL DEFAULT 0,
  `xp_next`       INT UNSIGNED     NOT NULL DEFAULT 1000,
  `trophies`      INT UNSIGNED     NOT NULL DEFAULT 0,
  `gems`          INT UNSIGNED     NOT NULL DEFAULT 50,
  `clan_id`       INT UNSIGNED              DEFAULT NULL,
  `clan_name`     VARCHAR(50)               DEFAULT NULL,
  `clan_role`     ENUM('Leader','Co-Leader','Elder','Member') DEFAULT 'Member',
  `clan_level`    TINYINT          NOT NULL DEFAULT 0,
  `shield_until`  DATETIME                  DEFAULT NULL,
  `is_banned`     TINYINT(1)       NOT NULL DEFAULT 0,
  `ban_reason`    VARCHAR(255)              DEFAULT NULL,
  `created_at`    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_login`    DATETIME                  DEFAULT NULL,
  `last_ip`       VARCHAR(45)               DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_trophies` (`trophies` DESC),
  INDEX `idx_clan_id`  (`clan_id`),
  INDEX `idx_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================
-- BASES (village state per player)
-- ===================================================
CREATE TABLE `bases` (
  `id`              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`         INT UNSIGNED NOT NULL UNIQUE,
  `buildings_json`  LONGTEXT     NOT NULL DEFAULT ('[]'),
  `resources_json`  TEXT         NOT NULL DEFAULT ('{}'),
  `research_json`   TEXT         NOT NULL DEFAULT ('[]'),
  `quests_json`     TEXT         NOT NULL DEFAULT ('[]'),
  `troops_json`     TEXT         NOT NULL DEFAULT ('[]'),
  `created_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================
-- CLANS
-- ===================================================
CREATE TABLE `clans` (
  `id`          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `name`        VARCHAR(50)   NOT NULL UNIQUE,
  `description` VARCHAR(255)           DEFAULT NULL,
  `tag`         VARCHAR(8)    NOT NULL UNIQUE,
  `level`       TINYINT       NOT NULL DEFAULT 1,
  `xp`          INT UNSIGNED  NOT NULL DEFAULT 0,
  `members`     SMALLINT      NOT NULL DEFAULT 1,
  `max_members` SMALLINT      NOT NULL DEFAULT 50,
  `trophies`    INT UNSIGNED  NOT NULL DEFAULT 0,
  `leader_id`   INT UNSIGNED  NOT NULL,
  `is_open`     TINYINT(1)    NOT NULL DEFAULT 1,
  `created_at`  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_trophies` (`trophies` DESC),
  FOREIGN KEY (`leader_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================
-- BATTLES (battle history)
-- ===================================================
CREATE TABLE `battles` (
  `id`              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `attacker_id`     INT UNSIGNED    NOT NULL,
  `defender_id`     INT UNSIGNED    NOT NULL,
  `attacker_name`   VARCHAR(20)     NOT NULL,
  `defender_name`   VARCHAR(20)     NOT NULL,
  `result`          ENUM('win','loss','draw') NOT NULL,
  `stars`           TINYINT         NOT NULL DEFAULT 0,
  `destruction_pct` TINYINT         NOT NULL DEFAULT 0,
  `loot_gold`       INT UNSIGNED    NOT NULL DEFAULT 0,
  `loot_wood`       INT UNSIGNED    NOT NULL DEFAULT 0,
  `loot_food`       INT UNSIGNED    NOT NULL DEFAULT 0,
  `trophies_gained` SMALLINT        NOT NULL DEFAULT 0,
  `replay_json`     LONGTEXT                 DEFAULT NULL,
  `battle_type`     ENUM('pvp','pve','clan_war','practice') NOT NULL DEFAULT 'pvp',
  `created_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_attacker` (`attacker_id`),
  INDEX `idx_defender` (`defender_id`),
  INDEX `idx_created`  (`created_at` DESC),
  FOREIGN KEY (`attacker_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`defender_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================
-- CHAT MESSAGES
-- ===================================================
CREATE TABLE `chat_messages` (
  `id`         INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `user_id`    INT UNSIGNED    NOT NULL,
  `username`   VARCHAR(20)     NOT NULL,
  `channel`    ENUM('global','clan','system') NOT NULL DEFAULT 'global',
  `clan_id`    INT UNSIGNED             DEFAULT NULL,
  `message`    VARCHAR(120)    NOT NULL,
  `created_at` DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_channel_created` (`channel`, `created_at` DESC),
  INDEX `idx_clan`            (`clan_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================
-- MATCHMAKING QUEUE
-- ===================================================
CREATE TABLE `matchmaking_queue` (
  `id`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`    INT UNSIGNED NOT NULL UNIQUE,
  `trophies`   INT UNSIGNED NOT NULL DEFAULT 0,
  `joined_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_trophies_time` (`trophies`, `joined_at`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================
-- CLAN WARS
-- ===================================================
CREATE TABLE `clan_wars` (
  `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `clan_a_id`   INT UNSIGNED NOT NULL,
  `clan_b_id`   INT UNSIGNED NOT NULL,
  `clan_a_stars`SMALLINT     NOT NULL DEFAULT 0,
  `clan_b_stars`SMALLINT     NOT NULL DEFAULT 0,
  `status`      ENUM('preparation','battle','ended') NOT NULL DEFAULT 'preparation',
  `start_at`    DATETIME     NOT NULL,
  `end_at`      DATETIME     NOT NULL,
  `winner_id`   INT UNSIGNED          DEFAULT NULL,
  `created_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`clan_a_id`) REFERENCES `clans`(`id`),
  FOREIGN KEY (`clan_b_id`) REFERENCES `clans`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================
-- LOGIN ATTEMPTS (anti-brute force)
-- ===================================================
CREATE TABLE `login_attempts` (
  `id`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`    INT UNSIGNED          DEFAULT NULL,
  `ip`         VARCHAR(45)  NOT NULL,
  `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_ip_time` (`ip`, `created_at` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================
-- ACHIEVEMENTS
-- ===================================================
CREATE TABLE `achievements` (
  `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`     INT UNSIGNED NOT NULL,
  `achievement` VARCHAR(50)  NOT NULL,
  `earned_at`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_achievement` (`user_id`, `achievement`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================
-- LEADERBOARD SNAPSHOTS (season rankings)
-- ===================================================
CREATE TABLE `leaderboard_snapshots` (
  `id`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`    INT UNSIGNED NOT NULL,
  `season`     SMALLINT     NOT NULL DEFAULT 1,
  `rank`       INT UNSIGNED NOT NULL,
  `trophies`   INT UNSIGNED NOT NULL,
  `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_season` (`user_id`, `season`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================
-- DEFAULT DATA
-- ===================================================

-- System user for announcements
INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `level`, `trophies`, `is_banned`)
VALUES (1, 'SYSTEM', 'system@tribeofraiserph.com', '', 99, 999999, 0);

-- Seed leaderboard with mock data
INSERT INTO `users` (`username`, `email`, `password_hash`, `level`, `trophies`, `gems`) VALUES
  ('BayaniLaki',      'bayani@test.com',   '$2y$12$placeholder', 15, 4820, 200),
  ('AnakNgBuwan',     'anak@test.com',     '$2y$12$placeholder', 14, 4650, 150),
  ('HaringBundok',    'haring@test.com',   '$2y$12$placeholder', 13, 4480, 120),
  ('DiwataNG',        'diwata@test.com',   '$2y$12$placeholder', 13, 4320, 100),
  ('LakiSaLabas',     'laki@test.com',     '$2y$12$placeholder', 12, 4180, 80);

-- ===================================================
-- VIEWS (for convenience)
-- ===================================================

CREATE OR REPLACE VIEW `v_leaderboard` AS
  SELECT u.id, u.username, u.trophies, u.level,
         c.name AS clan_name, c.tag AS clan_tag
  FROM users u
  LEFT JOIN clans c ON u.clan_id = c.id
  WHERE u.is_banned = 0
  ORDER BY u.trophies DESC
  LIMIT 1000;

CREATE OR REPLACE VIEW `v_recent_battles` AS
  SELECT b.*, 
         a.username AS attacker_username,
         d.username AS defender_username
  FROM battles b
  JOIN users a ON b.attacker_id = a.id
  JOIN users d ON b.defender_id = d.id
  ORDER BY b.created_at DESC
  LIMIT 500;

-- Done
SELECT 'Tribe of Raise PH schema created successfully!' AS status;
