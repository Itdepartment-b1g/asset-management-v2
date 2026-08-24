ALTER TABLE "asset_information"
ADD COLUMN "department_id" TEXT,
ADD COLUMN "location_id" TEXT,
ADD COLUMN "legend_id" TEXT;

UPDATE "asset_information" AS ai
SET "department_id" = rel."B"
FROM (
  SELECT DISTINCT ON ("A") "A", "B"
  FROM "_asset_informationTodepartments"
  ORDER BY "A", "B"
) AS rel
WHERE ai."id" = rel."A"
  AND ai."department_id" IS NULL;

UPDATE "asset_information" AS ai
SET "location_id" = rel."B"
FROM (
  SELECT DISTINCT ON ("A") "A", "B"
  FROM "_asset_informationTolocations"
  ORDER BY "A", "B"
) AS rel
WHERE ai."id" = rel."A"
  AND ai."location_id" IS NULL;

UPDATE "asset_information" AS ai
SET "legend_id" = rel."B"
FROM (
  SELECT DISTINCT ON ("A") "A", "B"
  FROM "_asset_informationTolegend"
  ORDER BY "A", "B"
) AS rel
WHERE ai."id" = rel."A"
  AND ai."legend_id" IS NULL;

CREATE INDEX "asset_information_department_id_idx" ON "asset_information"("department_id");
CREATE INDEX "asset_information_location_id_idx" ON "asset_information"("location_id");
CREATE INDEX "asset_information_legend_id_idx" ON "asset_information"("legend_id");

ALTER TABLE "asset_information"
ADD CONSTRAINT "asset_information_department_id_fkey"
FOREIGN KEY ("department_id") REFERENCES "departments"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "asset_information"
ADD CONSTRAINT "asset_information_location_id_fkey"
FOREIGN KEY ("location_id") REFERENCES "locations"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "asset_information"
ADD CONSTRAINT "asset_information_legend_id_fkey"
FOREIGN KEY ("legend_id") REFERENCES "legend"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

DROP TABLE IF EXISTS "_asset_informationTodepartments";
DROP TABLE IF EXISTS "_asset_informationTolocations";
DROP TABLE IF EXISTS "_asset_informationTolegend";
DROP TABLE IF EXISTS "_asset_informationToconditions";
