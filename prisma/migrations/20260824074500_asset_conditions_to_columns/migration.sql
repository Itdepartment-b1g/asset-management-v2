ALTER TABLE "asset_information"
ADD COLUMN "current_condition_id" TEXT,
ADD COLUMN "condition_assignment_id" TEXT;

UPDATE "asset_information" AS ai
SET "current_condition_id" = c."id"
FROM "conditions" AS c
WHERE ai."current_condition_id" IS NULL
  AND ai."current_condition" IS NOT NULL
  AND LOWER(c."name") = LOWER(ai."current_condition"::text);

UPDATE "asset_information" AS ai
SET "condition_assignment_id" = c."id"
FROM "conditions" AS c
WHERE ai."condition_assignment_id" IS NULL
  AND ai."condition_assignment" IS NOT NULL
  AND LOWER(c."name") = LOWER(ai."condition_assignment"::text);

CREATE INDEX "asset_information_current_condition_id_idx" ON "asset_information"("current_condition_id");
CREATE INDEX "asset_information_condition_assignment_id_idx" ON "asset_information"("condition_assignment_id");

ALTER TABLE "asset_information"
ADD CONSTRAINT "asset_information_current_condition_id_fkey"
FOREIGN KEY ("current_condition_id") REFERENCES "conditions"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "asset_information"
ADD CONSTRAINT "asset_information_condition_assignment_id_fkey"
FOREIGN KEY ("condition_assignment_id") REFERENCES "conditions"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "asset_information"
DROP COLUMN "current_condition",
DROP COLUMN "condition_assignment";
