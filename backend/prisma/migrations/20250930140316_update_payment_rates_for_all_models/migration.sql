/*
  Warnings:

  - You are about to drop the column `hourlyRate` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `perObjectRate` on the `Project` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "vertical" TEXT,
    "annotationRequired" TEXT,
    "description" TEXT,
    "freelancersRequired" INTEGER NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "speedPercentage" REAL,
    "accuracyPercentage" REAL NOT NULL DEFAULT 90.0,
    "assetsPerDay" INTEGER,
    "hoursPerDay" REAL,
    "evaluationFrequency" TEXT NOT NULL DEFAULT 'WEEKLY',
    "paymentModel" TEXT NOT NULL,
    "hourlyRateAnnotation" REAL,
    "hourlyRateReview" REAL,
    "perAssetRateAnnotation" REAL,
    "perAssetRateReview" REAL,
    "expectedTimePerAsset" REAL,
    "perObjectRateAnnotation" REAL,
    "perObjectRateReview" REAL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Project" ("accuracyPercentage", "annotationRequired", "assetsPerDay", "createdAt", "createdBy", "description", "endDate", "evaluationFrequency", "expectedTimePerAsset", "freelancersRequired", "hoursPerDay", "id", "name", "paymentModel", "perAssetRateAnnotation", "perAssetRateReview", "projectId", "speedPercentage", "startDate", "status", "updatedAt", "vertical") SELECT "accuracyPercentage", "annotationRequired", "assetsPerDay", "createdAt", "createdBy", "description", "endDate", "evaluationFrequency", "expectedTimePerAsset", "freelancersRequired", "hoursPerDay", "id", "name", "paymentModel", "perAssetRateAnnotation", "perAssetRateReview", "projectId", "speedPercentage", "startDate", "status", "updatedAt", "vertical" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
CREATE UNIQUE INDEX "Project_projectId_key" ON "Project"("projectId");
CREATE INDEX "Project_projectId_idx" ON "Project"("projectId");
CREATE INDEX "Project_status_idx" ON "Project"("status");
CREATE INDEX "Project_startDate_idx" ON "Project"("startDate");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
