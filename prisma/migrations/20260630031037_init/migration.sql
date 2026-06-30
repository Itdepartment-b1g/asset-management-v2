-- CreateTable
CREATE TABLE "asset_information" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code_name" TEXT NOT NULL,
    "brand_name" TEXT NOT NULL,
    "serial_number" TEXT,
    "purchase_date" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "remarks" TEXT,
    "vendor_name" TEXT,
    "value" DOUBLE PRECISION,
    "warranty_end_date" TIMESTAMP(3),
    "warranty_information" TEXT,
    "warranty_document" TEXT,
    "life_end_date" TIMESTAMP(3),
    "agreement_document" TEXT,
    "date_issue" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "currently_issued_to_id" TEXT,

    CONSTRAINT "asset_information_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conditions" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conditions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "long" TEXT,
    "lat" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_asset_informationTocategories" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_asset_informationTocategories_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_asset_informationTodepartments" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_asset_informationTodepartments_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_asset_informationTolocation" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_asset_informationTolocation_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_asset_informationToconditions" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_asset_informationToconditions_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_original_issue" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_original_issue_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_asset_informationTocategories_B_index" ON "_asset_informationTocategories"("B");

-- CreateIndex
CREATE INDEX "_asset_informationTodepartments_B_index" ON "_asset_informationTodepartments"("B");

-- CreateIndex
CREATE INDEX "_asset_informationTolocation_B_index" ON "_asset_informationTolocation"("B");

-- CreateIndex
CREATE INDEX "_asset_informationToconditions_B_index" ON "_asset_informationToconditions"("B");

-- CreateIndex
CREATE INDEX "_original_issue_B_index" ON "_original_issue"("B");

-- AddForeignKey
ALTER TABLE "asset_information" ADD CONSTRAINT "asset_information_currently_issued_to_id_fkey" FOREIGN KEY ("currently_issued_to_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_asset_informationTocategories" ADD CONSTRAINT "_asset_informationTocategories_A_fkey" FOREIGN KEY ("A") REFERENCES "asset_information"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_asset_informationTocategories" ADD CONSTRAINT "_asset_informationTocategories_B_fkey" FOREIGN KEY ("B") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_asset_informationTodepartments" ADD CONSTRAINT "_asset_informationTodepartments_A_fkey" FOREIGN KEY ("A") REFERENCES "asset_information"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_asset_informationTodepartments" ADD CONSTRAINT "_asset_informationTodepartments_B_fkey" FOREIGN KEY ("B") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_asset_informationTolocation" ADD CONSTRAINT "_asset_informationTolocation_A_fkey" FOREIGN KEY ("A") REFERENCES "asset_information"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_asset_informationTolocation" ADD CONSTRAINT "_asset_informationTolocation_B_fkey" FOREIGN KEY ("B") REFERENCES "location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_asset_informationToconditions" ADD CONSTRAINT "_asset_informationToconditions_A_fkey" FOREIGN KEY ("A") REFERENCES "asset_information"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_asset_informationToconditions" ADD CONSTRAINT "_asset_informationToconditions_B_fkey" FOREIGN KEY ("B") REFERENCES "conditions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_original_issue" ADD CONSTRAINT "_original_issue_A_fkey" FOREIGN KEY ("A") REFERENCES "asset_information"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_original_issue" ADD CONSTRAINT "_original_issue_B_fkey" FOREIGN KEY ("B") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
