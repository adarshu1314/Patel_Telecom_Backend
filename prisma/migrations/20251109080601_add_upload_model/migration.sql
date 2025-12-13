-- CreateTable
CREATE TABLE "public"."uploads" (
    "id" SERIAL NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileExt" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "filePath" TEXT NOT NULL,
    "createdBy" INTEGER NOT NULL,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ticketId" INTEGER NOT NULL,

    CONSTRAINT "uploads_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."uploads" ADD CONSTRAINT "uploads_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "public"."Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
