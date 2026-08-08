CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE TYPE "TranscriptionStatus" AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TABLE "User" ("id" UUID NOT NULL DEFAULT gen_random_uuid(), "email" TEXT NOT NULL, "name" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "User_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE TABLE "Transcription" ("id" UUID NOT NULL DEFAULT gen_random_uuid(), "userId" UUID NOT NULL, "fileName" TEXT NOT NULL, "originalFileName" TEXT NOT NULL, "sourceUrl" TEXT, "status" "TranscriptionStatus" NOT NULL DEFAULT 'pending', "text" TEXT, "segments" JSONB, "language" VARCHAR(8) NOT NULL, "duration" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Transcription_pkey" PRIMARY KEY ("id"));
CREATE INDEX "Transcription_userId_createdAt_idx" ON "Transcription"("userId", "createdAt");
CREATE INDEX "Transcription_status_idx" ON "Transcription"("status");
ALTER TABLE "Transcription" ADD CONSTRAINT "Transcription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
