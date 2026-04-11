-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('STAFF', 'MANAGER', 'ADMIN');

-- CreateEnum
CREATE TYPE "AdminStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- AlterEnum
BEGIN;
CREATE TYPE "AuditTargetType_new" AS ENUM ('ADMIN_USER', 'CUSTOMER', 'CATEGORY', 'PRODUCT', 'OPTION_GROUP', 'OPTION', 'CART', 'ORDER', 'COUPON', 'PAYMENT');
ALTER TABLE "AuditLog" ALTER COLUMN "targetType" TYPE "AuditTargetType_new" USING ("targetType"::text::"AuditTargetType_new");
ALTER TYPE "AuditTargetType" RENAME TO "AuditTargetType_old";
ALTER TYPE "AuditTargetType_new" RENAME TO "AuditTargetType";
DROP TYPE "public"."AuditTargetType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_userId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_actorUserId_fkey";

-- DropForeignKey
ALTER TABLE "Cart" DROP CONSTRAINT "Cart_userId_fkey";

-- DropForeignKey
ALTER TABLE "Coupon" DROP CONSTRAINT "Coupon_createdByUserId_fkey";

-- DropForeignKey
ALTER TABLE "CouponRedemption" DROP CONSTRAINT "CouponRedemption_userId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_userId_fkey";

-- DropIndex
DROP INDEX "Address_userId_idx";

-- DropIndex
DROP INDEX "AuditLog_actorUserId_createdAt_idx";

-- DropIndex
DROP INDEX "Cart_userId_status_idx";

-- DropIndex
DROP INDEX "CouponRedemption_userId_redeemedAt_idx";

-- DropIndex
DROP INDEX "Notification_userId_isRead_createdAt_idx";

-- DropIndex
DROP INDEX "Order_userId_createdAt_idx";

-- AlterTable
ALTER TABLE "Address" DROP COLUMN "userId",
ADD COLUMN     "customerId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "AuditLog" DROP COLUMN "actorUserId",
ADD COLUMN     "actorAdminUserId" UUID;

-- AlterTable
ALTER TABLE "Cart" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "Coupon" DROP COLUMN "createdByUserId",
DROP COLUMN "perUserLimit",
ADD COLUMN     "createdByAdminId" UUID,
ADD COLUMN     "perCustomerLimit" INTEGER;

-- AlterTable
ALTER TABLE "CouponRedemption" DROP COLUMN "userId",
ADD COLUMN     "customerId" UUID;

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "userId",
ADD COLUMN     "adminUserId" UUID;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "userId",
ADD COLUMN     "customerId" UUID;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "marketingOptIn",
DROP COLUMN "role",
ADD COLUMN     "role" "AdminRole" NOT NULL DEFAULT 'STAFF',
DROP COLUMN "status",
ADD COLUMN     "status" "AdminStatus" NOT NULL DEFAULT 'ACTIVE',
ALTER COLUMN "id" DROP DEFAULT;

-- DropEnum
DROP TYPE "UserRole";

-- DropEnum
DROP TYPE "UserStatus";

-- CreateTable
CREATE TABLE "Customer" (
    "id" UUID NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "marketingOptIn" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Customer_email_idx" ON "Customer"("email");

-- CreateIndex
CREATE INDEX "Customer_phone_idx" ON "Customer"("phone");

-- CreateIndex
CREATE INDEX "Address_customerId_idx" ON "Address"("customerId");

-- CreateIndex
CREATE INDEX "AuditLog_actorAdminUserId_createdAt_idx" ON "AuditLog"("actorAdminUserId", "createdAt");

-- CreateIndex
CREATE INDEX "CouponRedemption_customerId_redeemedAt_idx" ON "CouponRedemption"("customerId", "redeemedAt");

-- CreateIndex
CREATE INDEX "Notification_adminUserId_isRead_createdAt_idx" ON "Notification"("adminUserId", "isRead", "createdAt");

-- CreateIndex
CREATE INDEX "Order_customerId_createdAt_idx" ON "Order"("customerId", "createdAt");

-- CreateIndex
CREATE INDEX "User_role_status_idx" ON "User"("role", "status");

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouponRedemption" ADD CONSTRAINT "CouponRedemption_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorAdminUserId_fkey" FOREIGN KEY ("actorAdminUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
