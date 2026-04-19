-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "contractNo" TEXT NOT NULL,
    "contractDate" DATETIME NOT NULL,
    "buyerPoNo" TEXT,
    "sellerId" INTEGER NOT NULL,
    "buyerId" INTEGER NOT NULL,
    "shipToId" INTEGER,
    "brandId" INTEGER,
    "sellerRepId" INTEGER,
    "buyerRepId" INTEGER,
    "deliveryTerms" TEXT,
    "paymentTerms" TEXT,
    "transporter" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "tolerance" TEXT,
    "deliveryDate" DATETIME,
    "labDipRequest" BOOLEAN NOT NULL DEFAULT false,
    "labDipDetail" TEXT,
    "preProductionRequest" BOOLEAN NOT NULL DEFAULT false,
    "preProductionDetail" TEXT,
    "barcodeRequest" BOOLEAN NOT NULL DEFAULT false,
    "barcodeDetail" TEXT,
    "labTestRequest" BOOLEAN NOT NULL DEFAULT false,
    "labTestDetail" TEXT,
    "specialDocsRequest" BOOLEAN NOT NULL DEFAULT false,
    "specialDocsDetail" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Order_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Order_shipToId_fkey" FOREIGN KEY ("shipToId") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Order_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Order_sellerRepId_fkey" FOREIGN KEY ("sellerRepId") REFERENCES "Representative" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Order_buyerRepId_fkey" FOREIGN KEY ("buyerRepId") REFERENCES "Representative" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("barcodeRequest", "brandId", "buyerId", "buyerPoNo", "buyerRepId", "contractDate", "contractNo", "createdAt", "currency", "deliveryTerms", "id", "labDipRequest", "paymentTerms", "preProductionRequest", "sellerId", "sellerRepId", "shipToId", "transporter", "updatedAt") SELECT "barcodeRequest", "brandId", "buyerId", "buyerPoNo", "buyerRepId", "contractDate", "contractNo", "createdAt", "currency", "deliveryTerms", "id", "labDipRequest", "paymentTerms", "preProductionRequest", "sellerId", "sellerRepId", "shipToId", "transporter", "updatedAt" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE UNIQUE INDEX "Order_contractNo_key" ON "Order"("contractNo");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
