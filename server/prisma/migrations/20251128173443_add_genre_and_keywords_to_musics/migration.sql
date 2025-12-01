-- AlterTable
ALTER TABLE "public"."musics" ADD COLUMN "genre" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "public"."musics" ADD COLUMN "key_words" TEXT[] DEFAULT ARRAY[]::TEXT[];

