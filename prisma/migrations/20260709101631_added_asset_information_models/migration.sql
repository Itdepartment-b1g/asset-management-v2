-- CreateTable
CREATE TABLE "asset_information" (
    "id" TEXT NOT NULL,
    "asset_name" TEXT NOT NULL,
    "code_name" TEXT NOT NULL,
    "serial_number" TEXT,
    "purchase_date" TIMESTAMP(3),
    "current_condition" TEXT,
    "status" TEXT,
    "remarks" TEXT,
    "vendor_name" TEXT,
    "cost_value" DOUBLE PRECISION,
    "salvage_value" DOUBLE PRECISION,
    "warranty_end_date" TIMESTAMP(3),
    "useful_life_end_date" TIMESTAMP(3),
    "original_issue_date" TIMESTAMP(3),
    "currently_issued_to_id" TEXT,

    CONSTRAINT "asset_information_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conditions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conditions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "legend" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "legend_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_asset_informationTodepartments" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_asset_informationTodepartments_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_asset_informationTolocations" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_asset_informationTolocations_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_asset_informationToconditions" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_asset_informationToconditions_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_asset_informationTolegend" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_asset_informationTolegend_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_original_issue" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_original_issue_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_asset_informationTodepartments_B_index" ON "_asset_informationTodepartments"("B");

-- CreateIndex
CREATE INDEX "_asset_informationTolocations_B_index" ON "_asset_informationTolocations"("B");

-- CreateIndex
CREATE INDEX "_asset_informationToconditions_B_index" ON "_asset_informationToconditions"("B");

-- CreateIndex
CREATE INDEX "_asset_informationTolegend_B_index" ON "_asset_informationTolegend"("B");

-- CreateIndex
CREATE INDEX "_original_issue_B_index" ON "_original_issue"("B");

-- AddForeignKey
ALTER TABLE "asset_information" ADD CONSTRAINT "asset_information_currently_issued_to_id_fkey" FOREIGN KEY ("currently_issued_to_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_asset_informationTodepartments" ADD CONSTRAINT "_asset_informationTodepartments_A_fkey" FOREIGN KEY ("A") REFERENCES "asset_information"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_asset_informationTodepartments" ADD CONSTRAINT "_asset_informationTodepartments_B_fkey" FOREIGN KEY ("B") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_asset_informationTolocations" ADD CONSTRAINT "_asset_informationTolocations_A_fkey" FOREIGN KEY ("A") REFERENCES "asset_information"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_asset_informationTolocations" ADD CONSTRAINT "_asset_informationTolocations_B_fkey" FOREIGN KEY ("B") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_asset_informationToconditions" ADD CONSTRAINT "_asset_informationToconditions_A_fkey" FOREIGN KEY ("A") REFERENCES "asset_information"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_asset_informationToconditions" ADD CONSTRAINT "_asset_informationToconditions_B_fkey" FOREIGN KEY ("B") REFERENCES "conditions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_asset_informationTolegend" ADD CONSTRAINT "_asset_informationTolegend_A_fkey" FOREIGN KEY ("A") REFERENCES "asset_information"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_asset_informationTolegend" ADD CONSTRAINT "_asset_informationTolegend_B_fkey" FOREIGN KEY ("B") REFERENCES "legend"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_original_issue" ADD CONSTRAINT "_original_issue_A_fkey" FOREIGN KEY ("A") REFERENCES "asset_information"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_original_issue" ADD CONSTRAINT "_original_issue_B_fkey" FOREIGN KEY ("B") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
