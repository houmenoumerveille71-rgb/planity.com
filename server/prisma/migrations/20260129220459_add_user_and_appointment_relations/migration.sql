/*
  Warnings:

  - You are about to drop the column `date` on the `appointment` table. All the data in the column will be lost.
  - You are about to drop the column `userEmail` on the `appointment` table. All the data in the column will be lost.
  - You are about to drop the column `userName` on the `appointment` table. All the data in the column will be lost.
  - Added the required column `salonId` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Appointment` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Service_salonId_fkey` ON `service`;

-- AlterTable
ALTER TABLE `appointment` DROP COLUMN `date`,
    DROP COLUMN `userEmail`,
    DROP COLUMN `userName`,
    ADD COLUMN `salonId` INTEGER NOT NULL,
    ADD COLUMN `startTime` DATETIME(3) NOT NULL,
    ADD COLUMN `userId` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Service` ADD CONSTRAINT `Service_salonId_fkey` FOREIGN KEY (`salonId`) REFERENCES `Salon`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_salonId_fkey` FOREIGN KEY (`salonId`) REFERENCES `Salon`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
