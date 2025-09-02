-- CreateTable
CREATE TABLE "user_activities" (
    "id" SERIAL NOT NULL,
    "sessionId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "trackId" INTEGER,
    "trackTitle" TEXT,
    "category" TEXT,
    "duration" INTEGER,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_activities_pkey" PRIMARY KEY ("id")
);
