-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'FREELANCER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AdminProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "department" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AdminProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FreelancerApplication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "age" INTEGER,
    "phone" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
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

-- CreateTable
CREATE TABLE "Freelancer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "freelancerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "timezone" TEXT,
    "gender" TEXT,
    "age" INTEGER,
    "domainExpertise" TEXT,
    "annotationTypes" TEXT,
    "annotationMethods" TEXT,
    "toolsProficiency" TEXT,
    "languageProficiency" TEXT,
    "availabilityType" TEXT,
    "hoursPerWeek" INTEGER,
    "preferredStartTime" TEXT,
    "preferredEndTime" TEXT,
    "unavailableDates" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "onboardingStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "currentTier" TEXT NOT NULL DEFAULT 'BRONZE',
    "currentGrade" TEXT NOT NULL DEFAULT 'C',
    "performanceTags" TEXT,
    "trainingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "trainingCompletedAt" DATETIME,
    "slackUserId" TEXT,
    "slackInvitedAt" DATETIME,
    "approvedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastActiveAt" DATETIME,
    CONSTRAINT "Freelancer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Freelancer_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "FreelancerApplication" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OnboardingTest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "freelancerId" TEXT NOT NULL,
    "testType" TEXT NOT NULL,
    "attemptNumber" INTEGER NOT NULL,
    "taskId" TEXT,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" DATETIME,
    "reviewedBy" TEXT,
    "reviewedAt" DATETIME,
    "confidenceScore" REAL,
    "grade" TEXT,
    "comments" TEXT,
    "passed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OnboardingTest_freelancerId_fkey" FOREIGN KEY ("freelancerId") REFERENCES "Freelancer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Project" (
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
    "hourlyRate" REAL,
    "perAssetRate" REAL,
    "perObjectRate" REAL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ProjectApplication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "freelancerId" TEXT NOT NULL,
    "availableHours" INTEGER NOT NULL,
    "appliedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fitmentTestId" TEXT,
    "fitmentTestScore" REAL,
    "fitmentTestPassed" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'APPLIED',
    "reviewedBy" TEXT,
    "reviewedAt" DATETIME,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProjectApplication_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProjectApplication_freelancerId_fkey" FOREIGN KEY ("freelancerId") REFERENCES "Freelancer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProjectAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "freelancerId" TEXT NOT NULL,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "expectedAssetsPerDay" INTEGER,
    "expectedHoursPerDay" REAL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "completedAt" DATETIME,
    "completionNotes" TEXT,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProjectAssignment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProjectAssignment_freelancerId_fkey" FOREIGN KEY ("freelancerId") REFERENCES "Freelancer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PerformanceRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "freelancerId" TEXT NOT NULL,
    "projectId" TEXT,
    "recordDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordType" TEXT NOT NULL,
    "month" INTEGER,
    "year" INTEGER,
    "hoursWorked" REAL,
    "assetsCompleted" INTEGER,
    "tasksCompleted" INTEGER,
    "avgTimePerTask" REAL,
    "comResponsibility" REAL,
    "comCommitment" REAL,
    "comInitiative" REAL,
    "comWillingness" REAL,
    "comCommunication" REAL,
    "comTotal" REAL,
    "qualSpeed" REAL,
    "qualDelibOmission" REAL,
    "qualAccuracy" REAL,
    "qualAttention" REAL,
    "qualUnannotated" REAL,
    "qualUnderstanding" REAL,
    "qualRejectedCount" INTEGER,
    "qualTotal" REAL,
    "overallScore" REAL,
    "recordedBy" TEXT,
    "recordedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PerformanceRecord_freelancerId_fkey" FOREIGN KEY ("freelancerId") REFERENCES "Freelancer" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PerformanceRecord_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PerformanceIntervention" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "freelancerId" TEXT NOT NULL,
    "interventionNumber" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "actionTaken" TEXT NOT NULL,
    "conductedBy" TEXT NOT NULL,
    "conductedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "followUpDate" DATETIME,
    "followUpNotes" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PerformanceIntervention_freelancerId_fkey" FOREIGN KEY ("freelancerId") REFERENCES "Freelancer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PaymentRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "freelancerId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "hoursWorked" REAL,
    "assetsCompleted" INTEGER,
    "objectsAnnotated" INTEGER,
    "hourlyRate" REAL,
    "assetRate" REAL,
    "objectRate" REAL,
    "totalAmount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'GHC',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paidAt" DATETIME,
    "notes" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PaymentRecord_freelancerId_fkey" FOREIGN KEY ("freelancerId") REFERENCES "Freelancer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "targetRole" TEXT,
    "targetTier" TEXT,
    "targetGrade" TEXT,
    "targetCountry" TEXT,
    "publishAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SystemConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "updatedBy" TEXT,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "AdminProfile_userId_key" ON "AdminProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FreelancerApplication_email_key" ON "FreelancerApplication"("email");

-- CreateIndex
CREATE INDEX "FreelancerApplication_status_idx" ON "FreelancerApplication"("status");

-- CreateIndex
CREATE INDEX "FreelancerApplication_email_idx" ON "FreelancerApplication"("email");

-- CreateIndex
CREATE INDEX "FreelancerApplication_country_idx" ON "FreelancerApplication"("country");

-- CreateIndex
CREATE INDEX "FreelancerApplication_submittedAt_idx" ON "FreelancerApplication"("submittedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Freelancer_freelancerId_key" ON "Freelancer"("freelancerId");

-- CreateIndex
CREATE UNIQUE INDEX "Freelancer_userId_key" ON "Freelancer"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Freelancer_applicationId_key" ON "Freelancer"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "Freelancer_email_key" ON "Freelancer"("email");

-- CreateIndex
CREATE INDEX "Freelancer_freelancerId_idx" ON "Freelancer"("freelancerId");

-- CreateIndex
CREATE INDEX "Freelancer_status_idx" ON "Freelancer"("status");

-- CreateIndex
CREATE INDEX "Freelancer_currentTier_idx" ON "Freelancer"("currentTier");

-- CreateIndex
CREATE INDEX "Freelancer_currentGrade_idx" ON "Freelancer"("currentGrade");

-- CreateIndex
CREATE INDEX "Freelancer_country_idx" ON "Freelancer"("country");

-- CreateIndex
CREATE INDEX "Freelancer_onboardingStatus_idx" ON "Freelancer"("onboardingStatus");

-- CreateIndex
CREATE INDEX "OnboardingTest_freelancerId_idx" ON "OnboardingTest"("freelancerId");

-- CreateIndex
CREATE INDEX "OnboardingTest_testType_idx" ON "OnboardingTest"("testType");

-- CreateIndex
CREATE UNIQUE INDEX "Project_projectId_key" ON "Project"("projectId");

-- CreateIndex
CREATE INDEX "Project_projectId_idx" ON "Project"("projectId");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE INDEX "Project_startDate_idx" ON "Project"("startDate");

-- CreateIndex
CREATE INDEX "ProjectApplication_projectId_idx" ON "ProjectApplication"("projectId");

-- CreateIndex
CREATE INDEX "ProjectApplication_freelancerId_idx" ON "ProjectApplication"("freelancerId");

-- CreateIndex
CREATE INDEX "ProjectApplication_status_idx" ON "ProjectApplication"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectApplication_projectId_freelancerId_key" ON "ProjectApplication"("projectId", "freelancerId");

-- CreateIndex
CREATE INDEX "ProjectAssignment_projectId_idx" ON "ProjectAssignment"("projectId");

-- CreateIndex
CREATE INDEX "ProjectAssignment_freelancerId_idx" ON "ProjectAssignment"("freelancerId");

-- CreateIndex
CREATE INDEX "ProjectAssignment_status_idx" ON "ProjectAssignment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectAssignment_projectId_freelancerId_key" ON "ProjectAssignment"("projectId", "freelancerId");

-- CreateIndex
CREATE INDEX "PerformanceRecord_freelancerId_idx" ON "PerformanceRecord"("freelancerId");

-- CreateIndex
CREATE INDEX "PerformanceRecord_projectId_idx" ON "PerformanceRecord"("projectId");

-- CreateIndex
CREATE INDEX "PerformanceRecord_recordType_idx" ON "PerformanceRecord"("recordType");

-- CreateIndex
CREATE INDEX "PerformanceRecord_recordDate_idx" ON "PerformanceRecord"("recordDate");

-- CreateIndex
CREATE INDEX "PerformanceRecord_year_month_idx" ON "PerformanceRecord"("year", "month");

-- CreateIndex
CREATE INDEX "PerformanceIntervention_freelancerId_idx" ON "PerformanceIntervention"("freelancerId");

-- CreateIndex
CREATE INDEX "PerformanceIntervention_interventionNumber_idx" ON "PerformanceIntervention"("interventionNumber");

-- CreateIndex
CREATE INDEX "PaymentRecord_freelancerId_idx" ON "PaymentRecord"("freelancerId");

-- CreateIndex
CREATE INDEX "PaymentRecord_year_month_idx" ON "PaymentRecord"("year", "month");

-- CreateIndex
CREATE INDEX "PaymentRecord_status_idx" ON "PaymentRecord"("status");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentRecord_freelancerId_year_month_key" ON "PaymentRecord"("freelancerId", "year", "month");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX "Announcement_isPublished_idx" ON "Announcement"("isPublished");

-- CreateIndex
CREATE INDEX "Announcement_publishAt_idx" ON "Announcement"("publishAt");

-- CreateIndex
CREATE UNIQUE INDEX "SystemConfig_key_key" ON "SystemConfig"("key");

-- CreateIndex
CREATE INDEX "SystemConfig_key_idx" ON "SystemConfig"("key");
