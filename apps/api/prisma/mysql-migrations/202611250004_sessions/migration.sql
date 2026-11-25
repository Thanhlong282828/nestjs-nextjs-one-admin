-- CreateTable
CREATE TABLE `identity_sessions` (
    `id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `token_hash` CHAR(64) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `revoked_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `identity_sessions_token_hash_key`(`token_hash`),
    INDEX `identity_sessions_user_id_revoked_at_expires_at_idx`(`user_id`, `revoked_at`, `expires_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `identity_sessions` ADD CONSTRAINT `identity_sessions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `identity_users`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

