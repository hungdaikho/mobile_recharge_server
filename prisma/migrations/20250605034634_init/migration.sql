-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "operator" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "metadata" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyStatistic" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "country" TEXT NOT NULL,
    "totalTopups" INTEGER NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "totalRefunded" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyStatistic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsPost" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "thumbnailUrl" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Country" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "continent" TEXT NOT NULL,
    "currencyCode" TEXT NOT NULL,
    "currencyName" TEXT NOT NULL,
    "currencySymbol" TEXT NOT NULL,
    "flag" TEXT NOT NULL,
    "callingCodes" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "Operator" (
    "id" TEXT NOT NULL,
    "operatorId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "bundle" BOOLEAN NOT NULL DEFAULT false,
    "data" BOOLEAN NOT NULL DEFAULT false,
    "pin" BOOLEAN NOT NULL DEFAULT false,
    "comboProduct" BOOLEAN NOT NULL DEFAULT false,
    "supportsLocalAmounts" BOOLEAN NOT NULL DEFAULT false,
    "supportsGeographicalRechargePlans" BOOLEAN NOT NULL DEFAULT false,
    "denominationType" TEXT NOT NULL,
    "senderCurrencyCode" TEXT NOT NULL,
    "senderCurrencySymbol" TEXT NOT NULL,
    "destinationCurrencyCode" TEXT NOT NULL,
    "destinationCurrencySymbol" TEXT NOT NULL,
    "commission" DOUBLE PRECISION NOT NULL,
    "internationalDiscount" DOUBLE PRECISION NOT NULL,
    "localDiscount" DOUBLE PRECISION NOT NULL,
    "mostPopularAmount" DOUBLE PRECISION,
    "mostPopularLocalAmount" DOUBLE PRECISION,
    "minAmount" DOUBLE PRECISION,
    "maxAmount" DOUBLE PRECISION,
    "localMinAmount" DOUBLE PRECISION,
    "localMaxAmount" DOUBLE PRECISION,
    "countryCode" TEXT NOT NULL,
    "fxRate" DOUBLE PRECISION NOT NULL,
    "fxCurrencyCode" TEXT NOT NULL,
    "logoUrls" TEXT[],
    "fixedAmounts" DOUBLE PRECISION[],
    "fixedAmountsDescriptions" JSONB NOT NULL,
    "localFixedAmounts" DOUBLE PRECISION[],
    "localFixedAmountsDescriptions" JSONB NOT NULL,
    "suggestedAmounts" DOUBLE PRECISION[],
    "suggestedAmountsMap" JSONB NOT NULL,
    "internationalFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "localFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "localPercentageFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "internationalPercentageFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "geographicalRechargePlans" JSONB NOT NULL DEFAULT '[]',
    "promotions" JSONB NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Operator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SimType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,

    CONSTRAINT "SimType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiCredential" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "apiSecret" TEXT NOT NULL,
    "baseUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApiCredential_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_username_key" ON "AdminUser"("username");

-- CreateIndex
CREATE UNIQUE INDEX "NewsPost_slug_key" ON "NewsPost"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Operator_operatorId_key" ON "Operator"("operatorId");

-- CreateIndex
CREATE UNIQUE INDEX "ApiCredential_name_key" ON "ApiCredential"("name");

-- AddForeignKey
ALTER TABLE "Operator" ADD CONSTRAINT "Operator_countryCode_fkey" FOREIGN KEY ("countryCode") REFERENCES "Country"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimType" ADD CONSTRAINT "SimType_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Operator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
