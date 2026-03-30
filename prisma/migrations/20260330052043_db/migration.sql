/*
  Warnings:

  - A unique constraint covering the columns `[resume_id]` on the table `contacts` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[resume_id]` on the table `skills` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "contacts_resume_id_key" ON "contacts"("resume_id");

-- CreateIndex
CREATE UNIQUE INDEX "skills_resume_id_key" ON "skills"("resume_id");
