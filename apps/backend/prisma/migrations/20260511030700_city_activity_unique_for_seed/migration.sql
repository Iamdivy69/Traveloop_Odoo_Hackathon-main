-- Idempotent seed upserts: compound unique keys for City and Activity
ALTER TABLE "cities" ADD CONSTRAINT "cities_name_country_key" UNIQUE ("name", "country");

ALTER TABLE "activities" ADD CONSTRAINT "activities_city_id_name_key" UNIQUE ("city_id", "name");
