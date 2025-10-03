-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FreelancerApplication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "formData" TEXT,
    "age" INTEGER,
    "city" TEXT,
    "country" TEXT,
    "gender" TEXT,
    "timezone" TEXT,
    "educationLevel" TEXT,
    "degreeName" TEXT,
    "educationInstitution" TEXT,
    "hasLaptop" BOOLEAN NOT NULL DEFAULT false,
    "hasReliableInternet" BOOLEAN NOT NULL DEFAULT false,
    "remoteWorkAvailable" BOOLEAN NOT NULL DEFAULT false,
    "employmentStatus" TEXT,
    "preferredStartTime" TEXT,
    "preferredEndTime" TEXT,
    "availabilityType" TEXT,
    "hoursPerWeek" INTEGER,
    "interestedLongTerm" BOOLEAN NOT NULL DEFAULT false,
    "relevantExperience" TEXT,
    "yearsOfExperience" REAL,
    "previousCompanies" TEXT,
    "annotationTypes" TEXT,
    "annotationMethods" TEXT,
    "annotationTools" TEXT,
    "strongestTool" TEXT,
    "languageProficiency" TEXT,
    "hasTrainedOthers" BOOLEAN NOT NULL DEFAULT false,
    "complexTaskDescription" TEXT,
    "howHeardAbout" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT,
    "reviewedAt" DATETIME,
    "rejectionReason" TEXT,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_FreelancerApplication" ("age", "annotationMethods", "annotationTools", "annotationTypes", "availabilityType", "city", "complexTaskDescription", "country", "degreeName", "educationInstitution", "educationLevel", "email", "employmentStatus", "firstName", "gender", "hasLaptop", "hasReliableInternet", "hasTrainedOthers", "hoursPerWeek", "howHeardAbout", "id", "interestedLongTerm", "languageProficiency", "lastName", "phone", "preferredEndTime", "preferredStartTime", "previousCompanies", "rejectionReason", "relevantExperience", "remoteWorkAvailable", "reviewedAt", "reviewedBy", "status", "strongestTool", "submittedAt", "timezone", "updatedAt", "yearsOfExperience") SELECT "age", "annotationMethods", "annotationTools", "annotationTypes", "availabilityType", "city", "complexTaskDescription", "country", "degreeName", "educationInstitution", "educationLevel", "email", "employmentStatus", "firstName", "gender", "hasLaptop", "hasReliableInternet", "hasTrainedOthers", "hoursPerWeek", "howHeardAbout", "id", "interestedLongTerm", "languageProficiency", "lastName", "phone", "preferredEndTime", "preferredStartTime", "previousCompanies", "rejectionReason", "relevantExperience", "remoteWorkAvailable", "reviewedAt", "reviewedBy", "status", "strongestTool", "submittedAt", "timezone", "updatedAt", "yearsOfExperience" FROM "FreelancerApplication";
DROP TABLE "FreelancerApplication";
ALTER TABLE "new_FreelancerApplication" RENAME TO "FreelancerApplication";
CREATE UNIQUE INDEX "FreelancerApplication_email_key" ON "FreelancerApplication"("email");
CREATE INDEX "FreelancerApplication_status_idx" ON "FreelancerApplication"("status");
CREATE INDEX "FreelancerApplication_email_idx" ON "FreelancerApplication"("email");
CREATE INDEX "FreelancerApplication_country_idx" ON "FreelancerApplication"("country");
CREATE INDEX "FreelancerApplication_submittedAt_idx" ON "FreelancerApplication"("submittedAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
