-- AlterTable
ALTER TABLE "podcat"."User" ADD COLUMN     "subscriptionCanceled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "subscriptionEndDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "podcat"."audios" ADD COLUMN     "duration" INTEGER;

-- AlterTable
ALTER TABLE "podcat"."categories" ADD COLUMN     "presenterName" TEXT,
ADD COLUMN     "presenterPersona" TEXT,
ADD COLUMN     "presenterVoiceId" TEXT;

-- CreateTable
CREATE TABLE "podcat"."audio_plays" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "audioId" INTEGER NOT NULL,
    "playedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" INTEGER,

    CONSTRAINT "audio_plays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "podcat"."notification_interests" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_interests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "podcat"."inquiries" (
    "id" SERIAL NOT NULL,
    "userId" TEXT,
    "type" TEXT NOT NULL,
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "email" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "podcat"."audio_schedulers" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "prompt" TEXT NOT NULL,
    "elevenLabsVoiceId" TEXT NOT NULL,
    "cronExpression" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastRunAt" TIMESTAMP(3),
    "nextRunAt" TIMESTAMP(3),
    "totalGenerated" INTEGER NOT NULL DEFAULT 0,
    "promptMode" TEXT NOT NULL DEFAULT 'single',
    "topicList" JSONB,
    "currentTopicIndex" INTEGER NOT NULL DEFAULT 0,
    "usePerplexity" BOOLEAN NOT NULL DEFAULT false,
    "perplexitySystemPrompt" TEXT,
    "publishDateOffset" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audio_schedulers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "podcat"."generated_audios" (
    "id" SERIAL NOT NULL,
    "schedulerId" INTEGER NOT NULL,
    "audioId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "generated_audios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "podcat"."payments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tid" TEXT NOT NULL,
    "cid" TEXT NOT NULL,
    "partnerOrderId" TEXT NOT NULL,
    "partnerUserId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "taxFreeAmount" INTEGER NOT NULL DEFAULT 0,
    "vatAmount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ready',
    "paymentMethodType" TEXT,
    "paymentType" TEXT NOT NULL DEFAULT 'onetime',
    "subscriptionId" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "podcat"."payment_histories" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "amount" INTEGER,
    "paymentMethodType" TEXT,
    "cardInfo" JSONB,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "podcat"."subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sid" TEXT NOT NULL,
    "cid" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "billingCycle" TEXT NOT NULL DEFAULT 'monthly',
    "amount" INTEGER NOT NULL,
    "taxFreeAmount" INTEGER NOT NULL DEFAULT 0,
    "vatAmount" INTEGER NOT NULL DEFAULT 0,
    "itemName" TEXT NOT NULL,
    "nextBillingDate" TIMESTAMP(3),
    "lastBillingDate" TIMESTAMP(3),
    "inactiveReason" TEXT,
    "inactiveAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "notification_interests_userId_key" ON "podcat"."notification_interests"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "generated_audios_audioId_key" ON "podcat"."generated_audios"("audioId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_tid_key" ON "podcat"."payments"("tid");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_sid_key" ON "podcat"."subscriptions"("sid");

-- AddForeignKey
ALTER TABLE "podcat"."audio_plays" ADD CONSTRAINT "audio_plays_audioId_fkey" FOREIGN KEY ("audioId") REFERENCES "podcat"."audios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "podcat"."audio_plays" ADD CONSTRAINT "audio_plays_userId_fkey" FOREIGN KEY ("userId") REFERENCES "podcat"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "podcat"."notification_interests" ADD CONSTRAINT "notification_interests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "podcat"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "podcat"."inquiries" ADD CONSTRAINT "inquiries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "podcat"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "podcat"."audio_schedulers" ADD CONSTRAINT "audio_schedulers_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "podcat"."categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "podcat"."generated_audios" ADD CONSTRAINT "generated_audios_schedulerId_fkey" FOREIGN KEY ("schedulerId") REFERENCES "podcat"."audio_schedulers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "podcat"."generated_audios" ADD CONSTRAINT "generated_audios_audioId_fkey" FOREIGN KEY ("audioId") REFERENCES "podcat"."audios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "podcat"."payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "podcat"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "podcat"."payments" ADD CONSTRAINT "payments_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "podcat"."subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "podcat"."payment_histories" ADD CONSTRAINT "payment_histories_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "podcat"."payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "podcat"."payment_histories" ADD CONSTRAINT "payment_histories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "podcat"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "podcat"."subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "podcat"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
