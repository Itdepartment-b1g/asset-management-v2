-- AlterTable
ALTER TABLE "user" ADD COLUMN     "created_by_id" TEXT;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
