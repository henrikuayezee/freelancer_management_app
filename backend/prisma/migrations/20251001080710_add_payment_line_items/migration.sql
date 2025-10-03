/*
  Warnings:

  - Added the required column `periodEnd` to the `PaymentRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `periodStart` to the `PaymentRecord` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "PaymentLineItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "paymentRecordId" TEXT NOT NULL,
    "projectId" TEXT,
    "description" TEXT NOT NULL,
    "workDate" DATETIME NOT NULL,
    "hoursWorked" REAL,
    "assetsCompleted" INTEGER,
    "objectsAnnotated" INTEGER,
    "rate" REAL NOT NULL,
    "rateType" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PaymentLineItem_paymentRecordId_fkey" FOREIGN KEY ("paymentRecordId") REFERENCES "PaymentRecord" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PaymentLineItem_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PaymentRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "freelancerId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "periodStart" DATETIME NOT NULL,
    "periodEnd" DATETIME NOT NULL,
    "hoursWorked" REAL,
    "assetsCompleted" INTEGER,
    "objectsAnnotated" INTEGER,
    "hourlyRate" REAL,
    "assetRate" REAL,
    "objectRate" REAL,
    "totalAmount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'GHC',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "approvedBy" TEXT,
    "approvedAt" DATETIME,
    "paidAt" DATETIME,
    "paymentMethod" TEXT,
    "referenceNumber" TEXT,
    "notes" TEXT,
    "internalNotes" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PaymentRecord_freelancerId_fkey" FOREIGN KEY ("freelancerId") REFERENCES "Freelancer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PaymentRecord" ("assetRate", "assetsCompleted", "createdAt", "createdBy", "currency", "freelancerId", "hourlyRate", "hoursWorked", "id", "month", "notes", "objectRate", "objectsAnnotated", "paidAt", "status", "totalAmount", "updatedAt", "year") SELECT "assetRate", "assetsCompleted", "createdAt", "createdBy", "currency", "freelancerId", "hourlyRate", "hoursWorked", "id", "month", "notes", "objectRate", "objectsAnnotated", "paidAt", "status", "totalAmount", "updatedAt", "year" FROM "PaymentRecord";
DROP TABLE "PaymentRecord";
ALTER TABLE "new_PaymentRecord" RENAME TO "PaymentRecord";
CREATE INDEX "PaymentRecord_freelancerId_idx" ON "PaymentRecord"("freelancerId");
CREATE INDEX "PaymentRecord_year_month_idx" ON "PaymentRecord"("year", "month");
CREATE INDEX "PaymentRecord_status_idx" ON "PaymentRecord"("status");
CREATE UNIQUE INDEX "PaymentRecord_freelancerId_year_month_key" ON "PaymentRecord"("freelancerId", "year", "month");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "PaymentLineItem_paymentRecordId_idx" ON "PaymentLineItem"("paymentRecordId");

-- CreateIndex
CREATE INDEX "PaymentLineItem_projectId_idx" ON "PaymentLineItem"("projectId");

-- CreateIndex
CREATE INDEX "PaymentLineItem_workDate_idx" ON "PaymentLineItem"("workDate");
