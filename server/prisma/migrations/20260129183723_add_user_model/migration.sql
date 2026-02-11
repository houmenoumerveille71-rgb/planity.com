-- DropIndex
DROP INDEX `Service_salonId_fkey` ON `service`;

-- AddForeignKey
ALTER TABLE `Service` ADD CONSTRAINT `Service_salonId_fkey` FOREIGN KEY (`salonId`) REFERENCES `Salon`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
