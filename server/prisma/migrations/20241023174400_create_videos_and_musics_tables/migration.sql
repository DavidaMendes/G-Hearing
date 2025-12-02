-- CreateTable
CREATE TABLE "public"."videos" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "audio_path" TEXT,
    "duration" INTEGER,
    "file_size" BIGINT,
    "upload_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processing_status" TEXT NOT NULL DEFAULT 'pending',
    "unrecognized_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."musics" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "album" TEXT,
    "release_date" TEXT,
    "label" TEXT,
    "isrc" TEXT NOT NULL,
    "song_link" TEXT,
    "apple_music_id" TEXT,
    "spotify_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "musics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."video_musics" (
    "id" SERIAL NOT NULL,
    "video_id" INTEGER NOT NULL,
    "music_id" INTEGER NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "video_musics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "musics_isrc_key" ON "public"."musics"("isrc");

-- CreateIndex
CREATE UNIQUE INDEX "video_musics_video_id_music_id_start_time_end_time_key" ON "public"."video_musics"("video_id", "music_id", "start_time", "end_time");

-- AddForeignKey
ALTER TABLE "public"."videos" ADD CONSTRAINT "videos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."video_musics" ADD CONSTRAINT "video_musics_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."video_musics" ADD CONSTRAINT "video_musics_music_id_fkey" FOREIGN KEY ("music_id") REFERENCES "public"."musics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
