-- CreateTable
CREATE TABLE "Groups" (
    "uid" TEXT NOT NULL PRIMARY KEY
);

-- CreateTable
CREATE TABLE "Teachers" (
    "name" TEXT NOT NULL PRIMARY KEY
);

-- CreateTable
CREATE TABLE "Locations" (
    "uid" TEXT NOT NULL PRIMARY KEY
);

-- CreateTable
CREATE TABLE "Slots" (
    "uid" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "start" DATETIME NOT NULL,
    "end" DATETIME NOT NULL,
    "override" BOOLEAN NOT NULL
);

-- CreateTable
CREATE TABLE "_GroupsToSlots" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_GroupsToSlots_A_fkey" FOREIGN KEY ("A") REFERENCES "Groups" ("uid") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_GroupsToSlots_B_fkey" FOREIGN KEY ("B") REFERENCES "Slots" ("uid") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_LocationsToSlots" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_LocationsToSlots_A_fkey" FOREIGN KEY ("A") REFERENCES "Locations" ("uid") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_LocationsToSlots_B_fkey" FOREIGN KEY ("B") REFERENCES "Slots" ("uid") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_SlotsToTeachers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_SlotsToTeachers_A_fkey" FOREIGN KEY ("A") REFERENCES "Slots" ("uid") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_SlotsToTeachers_B_fkey" FOREIGN KEY ("B") REFERENCES "Teachers" ("name") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Groups_uid_key" ON "Groups"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "Teachers_name_key" ON "Teachers"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Locations_uid_key" ON "Locations"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "Slots_uid_key" ON "Slots"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "_GroupsToSlots_AB_unique" ON "_GroupsToSlots"("A", "B");

-- CreateIndex
CREATE INDEX "_GroupsToSlots_B_index" ON "_GroupsToSlots"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_LocationsToSlots_AB_unique" ON "_LocationsToSlots"("A", "B");

-- CreateIndex
CREATE INDEX "_LocationsToSlots_B_index" ON "_LocationsToSlots"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_SlotsToTeachers_AB_unique" ON "_SlotsToTeachers"("A", "B");

-- CreateIndex
CREATE INDEX "_SlotsToTeachers_B_index" ON "_SlotsToTeachers"("B");
