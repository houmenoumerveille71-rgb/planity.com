-- DropIndex
DROP INDEX `Appointment_salonId_fkey` ON `appointment`;

-- DropIndex
DROP INDEX `Appointment_serviceId_fkey` ON `appointment`;

-- DropIndex
DROP INDEX `Appointment_userId_fkey` ON `appointment`;

-- DropIndex
DROP INDEX `SalonAvailability_salonId_fkey` ON `salonavailability`;

-- DropIndex
DROP INDEX `Service_salonId_fkey` ON `service`;

-- AlterTable
ALTER TABLE `salon` ADD COLUMN `latitude` DOUBLE NULL,
    ADD COLUMN `longitude` DOUBLE NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `businessType` VARCHAR(191) NULL,
    ADD COLUMN `experience` VARCHAR(191) NULL,
    ADD COLUMN `siret` VARCHAR(191) NULL,
    ADD COLUMN `workLocation` VARCHAR(191) NULL,
    ADD COLUMN `workRhythm` VARCHAR(191) NULL;

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
