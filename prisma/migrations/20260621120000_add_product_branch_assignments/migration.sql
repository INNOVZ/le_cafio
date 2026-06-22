-- A product may be available at multiple restaurant locations.
CREATE TABLE "ProductBranchAssignment" (
    "productId" UUID NOT NULL,
    "restaurantLocationId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductBranchAssignment_pkey" PRIMARY KEY ("productId", "restaurantLocationId")
);

CREATE INDEX "ProductBranchAssignment_restaurantLocationId_productId_idx"
ON "ProductBranchAssignment"("restaurantLocationId", "productId");

-- Preserve products that were explicitly assigned to one branch.
INSERT INTO "ProductBranchAssignment" ("productId", "restaurantLocationId")
SELECT "id", "restaurantLocationId"
FROM "Product"
WHERE "restaurantLocationId" IS NOT NULL;

-- Before this migration, an unassigned product appeared in every branch menu.
-- Materialize that behaviour for all branches that exist at deployment time.
INSERT INTO "ProductBranchAssignment" ("productId", "restaurantLocationId")
SELECT product."id", location."id"
FROM "Product" AS product
CROSS JOIN "RestaurantLocation" AS location
WHERE product."restaurantLocationId" IS NULL;

ALTER TABLE "Product"
DROP CONSTRAINT "Product_restaurantLocationId_fkey";

DROP INDEX "Product_restaurantLocationId_idx";

ALTER TABLE "Product"
DROP COLUMN "restaurantLocationId";

ALTER TABLE "ProductBranchAssignment"
ADD CONSTRAINT "ProductBranchAssignment_productId_fkey"
FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProductBranchAssignment"
ADD CONSTRAINT "ProductBranchAssignment_restaurantLocationId_fkey"
FOREIGN KEY ("restaurantLocationId") REFERENCES "RestaurantLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
