-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "restaurantLocationId" UUID;

-- CreateIndex
CREATE INDEX "Product_restaurantLocationId_idx" ON "Product"("restaurantLocationId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_restaurantLocationId_fkey" FOREIGN KEY ("restaurantLocationId") REFERENCES "RestaurantLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
