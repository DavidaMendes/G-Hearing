-- CreateTable
CREATE TABLE "public"."users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- InsertDefaultUser
INSERT INTO "users" ("name", "email", "password", "is_active", "created_at", "updated_at") 
VALUES (
  'Administrador', 
  'admin@ghearing.com', 
  '$2b$10$zA9qj5wMjiIFrn9ptenlCu.H1YeLD.qIJvv0HlAGOfW.FNU5nXFFW', 
  true, 
  NOW(), 
  NOW()
);
