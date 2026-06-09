ALTER TABLE "feedbacks"
ADD COLUMN IF NOT EXISTS "resolved_by" UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'feedbacks_resolved_by_fkey'
  ) THEN
    ALTER TABLE "feedbacks"
      ADD CONSTRAINT "feedbacks_resolved_by_fkey"
      FOREIGN KEY ("resolved_by") REFERENCES "users"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION;
  END IF;
END $$;
