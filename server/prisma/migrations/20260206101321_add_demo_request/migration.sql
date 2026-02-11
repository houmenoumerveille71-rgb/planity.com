-- DropIndex
DROP INDEX `Appointment_salonId_fkey` ON `appointment`;

-- DropIndex
DROP INDEX `Appointment_serviceId_fkey` ON `appointment`;

-- DropIndex
DROP INDEX `Appointment_userId_fkey` ON `appointment`;

-- DropIndex
DROP INDEX `Invitation_salonId_fkey` ON `invitation`;

-- DropIndex
DROP INDEX `SalonAvailability_salonId_fkey` ON `salonavailability`;

-- DropIndex
DROP INDEX `Service_salonId_fkey` ON `service`;

-- CreateTable
CREATE TABLE `DemoRequest` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `salonName` VARCHAR(191) NULL,
    `salonType` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `contactName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `hasLocal` BOOLEAN NULL,
    `workLocation` VARCHAR(191) NULL,
    `experience` VARCHAR(191) NULL,
    `workRhythm` VARCHAR(191) NULL,
    `siret` VARCHAR(191) NULL,
    `collaborators` INTEGER NULL,
    `hasSoftware` BOOLEAN NULL,
    `source` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `adminNotes` VARCHAR(191) NULL,
    `validatedBy` INTEGER NULL,
    `validatedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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

-- AddForeignKey
ALTER TABLE `Invitation` ADD CONSTRAINT `Invitation_salonId_fkey` FOREIGN KEY (`salonId`) REFERENCES `Salon`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
