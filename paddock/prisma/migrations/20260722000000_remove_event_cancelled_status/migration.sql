-- Fold any existing CANCELLED events into COMPLETED before dropping the enum value.
UPDATE "events" SET "status" = 'COMPLETED' WHERE "status" = 'CANCELLED';

-- Recreate EventStatus without CANCELLED.
CREATE TYPE "EventStatus_new" AS ENUM ('DRAFT', 'PUBLISHED', 'ONGOING', 'COMPLETED');
ALTER TABLE "events" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "events" ALTER COLUMN "status" TYPE "EventStatus_new" USING ("status"::text::"EventStatus_new");
ALTER TABLE "events" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
DROP TYPE "EventStatus";
ALTER TYPE "EventStatus_new" RENAME TO "EventStatus";
