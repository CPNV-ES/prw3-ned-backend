/*
  Warnings:

  - You are about to drop the column `authorId` on the `comments` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `comments` table. All the data in the column will be lost.
  - You are about to drop the column `projectId` on the `comments` table. All the data in the column will be lost.
  - You are about to drop the column `authorId` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `demoUrl` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `repositoryUrl` on the `projects` table. All the data in the column will be lost.
  - Added the required column `author_id` to the `comments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `project_id` to the `comments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `author_id` to the `projects` table without a default value. This is not possible if the table is not empty.
  - Added the required column `demo_url` to the `projects` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image_url` to the `projects` table without a default value. This is not possible if the table is not empty.
  - Added the required column `repository_url` to the `projects` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `comments` DROP FOREIGN KEY `comments_authorId_fkey`;

-- DropForeignKey
ALTER TABLE `comments` DROP FOREIGN KEY `comments_projectId_fkey`;

-- DropForeignKey
ALTER TABLE `projects` DROP FOREIGN KEY `projects_authorId_fkey`;

-- DropIndex
DROP INDEX `comments_authorId_fkey` ON `comments`;

-- DropIndex
DROP INDEX `comments_projectId_fkey` ON `comments`;

-- DropIndex
DROP INDEX `projects_authorId_fkey` ON `projects`;

-- AlterTable
ALTER TABLE `comments` DROP COLUMN `authorId`,
    DROP COLUMN `createdAt`,
    DROP COLUMN `projectId`,
    ADD COLUMN `author_id` INTEGER NOT NULL,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `project_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `projects` DROP COLUMN `authorId`,
    DROP COLUMN `createdAt`,
    DROP COLUMN `demoUrl`,
    DROP COLUMN `imageUrl`,
    DROP COLUMN `repositoryUrl`,
    ADD COLUMN `author_id` INTEGER NOT NULL,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `demo_url` VARCHAR(191) NOT NULL,
    ADD COLUMN `image_url` VARCHAR(191) NOT NULL,
    ADD COLUMN `repository_url` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `ProjectTags` (
    `project_id` INTEGER NOT NULL,
    `tag_id` INTEGER NOT NULL,

    PRIMARY KEY (`project_id`, `tag_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tags` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Tags_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `projects` ADD CONSTRAINT `projects_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProjectTags` ADD CONSTRAINT `ProjectTags_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProjectTags` ADD CONSTRAINT `ProjectTags_tag_id_fkey` FOREIGN KEY (`tag_id`) REFERENCES `Tags`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comments` ADD CONSTRAINT `comments_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comments` ADD CONSTRAINT `comments_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
