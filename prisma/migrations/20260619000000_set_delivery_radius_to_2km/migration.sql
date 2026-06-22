-- Limit all restaurant delivery areas to a 2 km radius.
ALTER TABLE "RestaurantLocation"
ALTER COLUMN "deliveryRadiusKm" SET DEFAULT 2.00;

UPDATE "RestaurantLocation"
SET "deliveryRadiusKm" = 2.00;
