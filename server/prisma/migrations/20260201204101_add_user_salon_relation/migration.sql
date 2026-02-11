/*
  Warnings:

  - You are about to drop the column `city` on the `salon` table. All the data in the column will be lost.
  - You are about to drop the column `latitude` on the `salon` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `salon` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `service` table. All the data in the column will be lost.
  - You are about to drop the `servicecategory` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Salon` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `Appointment_salonId_fkey` ON `appointment`;

-- DropIndex
DROP INDEX `Appointment_serviceId_fkey` ON `appointment`;

-- DropIndex
DROP INDEX `Appointment_userId_fkey` ON `appointment`;

-- DropIndex
DROP INDEX `SalonAvailability_salonId_fkey` ON `salonavailability`;

-- DropIndex
DROP INDEX `Service_categoryId_fkey` ON `service`;

-- DropIndex
DROP INDEX `Service_salonId_fkey` ON `service`;

-- AlterTable
ALTER TABLE `salon` DROP COLUMN `city`,
    DROP COLUMN `latitude`,
    DROP COLUMN `longitude`,
    ADD COLUMN `cancellationDelay` VARCHAR(191) NOT NULL DEFAULT '24',
    ADD COLUMN `depositRequired` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `openingHours` VARCHAR(191) NOT NULL DEFAULT '9h-19h',
    ADD COLUMN `userId` INTEGER NULL,
    ADD COLUMN `validationMode` VARCHAR(191) NOT NULL DEFAULT 'auto';

-- AlterTable
ALTER TABLE `service` DROP COLUMN `categoryId`;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `phone` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `servicecategory`;

-- CreateIndex
CREATE UNIQUE INDEX `Salon_userId_key` ON `Salon`(`userId`);

-- AddForeignKey
ALTER TABLE `Salon` ADD CONSTRAINT `Salon_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalonAvailability` ADD CONSTRAINT `SalonAvailability_salonId_fkey` FOREIGN KEY (`salonId`) REFERENCES `Salon`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Service` ADD CONSTRAINT `Service_salonId_fkey` FOREIGN KEY (`salonId`) REFERENCES `Salon`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_salonId_fkey` FOREIGN KEY (`salonId`) REFERENCES `Salon`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_appointmentId_fkey` FOREIGN KEY (`appointmentId`) REFERENCES `Appointment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
