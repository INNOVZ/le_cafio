-- AlterEnum
ALTER TYPE "AuditTargetType" ADD VALUE 'RESTAURANT_LOCATION';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deliveryDistanceKm" DECIMAL(5,2),
ADD COLUMN     "deliveryLatitude" DECIMAL(10,7),
ADD COLUMN     "deliveryLongitude" DECIMAL(10,7),
ADD COLUMN     "deliveryValidatedAt" TIMESTAMP(3),
ADD COLUMN     "restaurantLocationId" UUID;

-- CreateTable
CREATE TABLE "RestaurantLocation" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "line1" TEXT NOT NULL,
    "line2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "postalCode" TEXT,
    "country" TEXT NOT NULL DEFAULT 'IT',
    "latitude" DECIMAL(10,7) NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,
    "deliveryRadiusKm" DECIMAL(5,2) NOT NULL DEFAULT 5,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RestaurantLocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RestaurantLocation_slug_key" ON "RestaurantLocation"("slug");

-- CreateIndex
CREATE INDEX "RestaurantLocation_isActive_city_idx" ON "RestaurantLocation"("isActive", "city");

-- CreateIndex
CREATE INDEX "Order_restaurantLocationId_createdAt_idx" ON "Order"("restaurantLocationId", "createdAt");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_restaurantLocationId_fkey" FOREIGN KEY ("restaurantLocationId") REFERENCES "RestaurantLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
