-- AlterTable
ALTER TABLE "user" ADD COLUMN "employee_code" TEXT,
ADD COLUMN "hris_employee_id" TEXT,
ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "last_login_at" TIMESTAMP(3);

-- AlterTable: local UUID default for new users (existing ids unchanged)
ALTER TABLE "user" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- CreateIndex
CREATE UNIQUE INDEX "user_employee_code_key" ON "user"("employee_code");

-- CreateIndex
CREATE UNIQUE INDEX "user_hris_employee_id_key" ON "user"("hris_employee_id");
