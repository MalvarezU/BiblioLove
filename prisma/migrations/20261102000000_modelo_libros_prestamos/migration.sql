-- Nuevo modelo de datos: libros, ejemplares, reservas y prestamos.
-- Se crean tablas nuevas sin eliminar las tablas anteriores para evitar
-- perdida de datos durante la transicion.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS "category" (
    "id" SMALLSERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "genre" (
    "id" SMALLSERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    CONSTRAINT "genre_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "author" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "last_name" VARCHAR(255) NOT NULL,
    "biography" TEXT,
    CONSTRAINT "author_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "user" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "last_name" VARCHAR(255),
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "address" VARCHAR(255),
    "phone" VARCHAR(255),
    "photo" VARCHAR(255),
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATE NOT NULL DEFAULT CURRENT_DATE,
    "updated_at" DATE NOT NULL DEFAULT CURRENT_DATE,
    "role" VARCHAR(255) NOT NULL DEFAULT 'USER',
    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_email_key" ON "user"("email");

CREATE TABLE IF NOT EXISTS "book" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "category" SMALLINT NOT NULL,
    "genre" SMALLINT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "author" INTEGER NOT NULL,
    CONSTRAINT "book_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "item" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "book" UUID NOT NULL,
    "status" VARCHAR(255) NOT NULL,
    "created_at" DATE NOT NULL DEFAULT CURRENT_DATE,
    "updated_at" DATE,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_by" UUID NOT NULL,
    "publisher" VARCHAR(255) NOT NULL,
    CONSTRAINT "item_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "reservation" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "item" UUID NOT NULL,
    "user" UUID NOT NULL,
    "issued_date" DATE NOT NULL,
    "min_checkout" DATE NOT NULL,
    "max_checkout" DATE NOT NULL,
    "status" VARCHAR(255) NOT NULL,
    CONSTRAINT "reservation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "checkout" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "item" UUID NOT NULL,
    "user" UUID NOT NULL,
    "checkout_date" DATE NOT NULL,
    "due_date" DATE NOT NULL,
    "return_date" DATE,
    "reservation" UUID,
    "status" VARCHAR(255) NOT NULL,
    CONSTRAINT "checkout_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "book_category_idx" ON "book"("category");
CREATE INDEX IF NOT EXISTS "book_genre_idx" ON "book"("genre");
CREATE INDEX IF NOT EXISTS "book_author_idx" ON "book"("author");
CREATE INDEX IF NOT EXISTS "item_book_idx" ON "item"("book");
CREATE INDEX IF NOT EXISTS "item_created_by_idx" ON "item"("created_by");
CREATE INDEX IF NOT EXISTS "reservation_item_idx" ON "reservation"("item");
CREATE INDEX IF NOT EXISTS "reservation_user_idx" ON "reservation"("user");
CREATE INDEX IF NOT EXISTS "checkout_item_idx" ON "checkout"("item");
CREATE INDEX IF NOT EXISTS "checkout_user_idx" ON "checkout"("user");
CREATE INDEX IF NOT EXISTS "checkout_reservation_idx" ON "checkout"("reservation");

ALTER TABLE "book" DROP CONSTRAINT IF EXISTS "fk_book_category_category";
ALTER TABLE "book" ADD CONSTRAINT "fk_book_category_category" FOREIGN KEY ("category") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "book" DROP CONSTRAINT IF EXISTS "fk_book_genre_genre";
ALTER TABLE "book" ADD CONSTRAINT "fk_book_genre_genre" FOREIGN KEY ("genre") REFERENCES "genre"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "book" DROP CONSTRAINT IF EXISTS "fk_book_author_author";
ALTER TABLE "book" ADD CONSTRAINT "fk_book_author_author" FOREIGN KEY ("author") REFERENCES "author"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "item" DROP CONSTRAINT IF EXISTS "fk_item_book_book";
ALTER TABLE "item" ADD CONSTRAINT "fk_item_book_book" FOREIGN KEY ("book") REFERENCES "book"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "item" DROP CONSTRAINT IF EXISTS "fk_item_created_by_user";
ALTER TABLE "item" ADD CONSTRAINT "fk_item_created_by_user" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "reservation" DROP CONSTRAINT IF EXISTS "fk_reservation_item_item";
ALTER TABLE "reservation" ADD CONSTRAINT "fk_reservation_item_item" FOREIGN KEY ("item") REFERENCES "item"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "reservation" DROP CONSTRAINT IF EXISTS "fk_reservation_user_user";
ALTER TABLE "reservation" ADD CONSTRAINT "fk_reservation_user_user" FOREIGN KEY ("user") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "checkout" DROP CONSTRAINT IF EXISTS "fk_checkout_reservation_reservation";
ALTER TABLE "checkout" ADD CONSTRAINT "fk_checkout_reservation_reservation" FOREIGN KEY ("reservation") REFERENCES "reservation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "checkout" DROP CONSTRAINT IF EXISTS "fk_checkout_item_item";
ALTER TABLE "checkout" ADD CONSTRAINT "fk_checkout_item_item" FOREIGN KEY ("item") REFERENCES "item"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "checkout" DROP CONSTRAINT IF EXISTS "fk_checkout_user_user";
ALTER TABLE "checkout" ADD CONSTRAINT "fk_checkout_user_user" FOREIGN KEY ("user") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
