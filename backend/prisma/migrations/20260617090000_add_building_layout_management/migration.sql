-- CreateTable
CREATE TABLE "buildings" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "building_code" VARCHAR(30) NOT NULL,
    "building_name" VARCHAR(120) NOT NULL,
    "address" TEXT,
    "description" TEXT,
    "status" VARCHAR(20) DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "buildings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "building_floors" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "building_id" UUID NOT NULL,
    "floor_code" VARCHAR(30) NOT NULL,
    "floor_name" VARCHAR(120) NOT NULL,
    "level_number" INTEGER NOT NULL,
    "description" TEXT,
    "status" VARCHAR(20) DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "building_floors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "building_gates" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "building_id" UUID NOT NULL,
    "gate_code" VARCHAR(30) NOT NULL,
    "gate_name" VARCHAR(120) NOT NULL,
    "gate_type" VARCHAR(20) NOT NULL DEFAULT 'ENTRY',
    "location_description" TEXT,
    "status" VARCHAR(20) DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "building_gates_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "zones" ADD COLUMN "floor_id" UUID;

-- AlterTable
ALTER TABLE "parking_slots"
ADD COLUMN "nearest_gate_id" UUID,
ADD COLUMN "near_elevator" BOOLEAN DEFAULT false,
ADD COLUMN "near_exit" BOOLEAN DEFAULT false,
ADD COLUMN "near_entry_gate" BOOLEAN DEFAULT false,
ADD COLUMN "near_exit_gate" BOOLEAN DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "buildings_building_code_key" ON "buildings"("building_code");

-- CreateIndex
CREATE UNIQUE INDEX "building_floors_building_id_floor_code_key" ON "building_floors"("building_id", "floor_code");

-- CreateIndex
CREATE UNIQUE INDEX "building_floors_building_id_level_number_key" ON "building_floors"("building_id", "level_number");

-- CreateIndex
CREATE UNIQUE INDEX "building_gates_building_id_gate_code_key" ON "building_gates"("building_id", "gate_code");

-- AddForeignKey
ALTER TABLE "building_floors" ADD CONSTRAINT "building_floors_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "buildings"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "building_gates" ADD CONSTRAINT "building_gates_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "buildings"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "zones" ADD CONSTRAINT "zones_floor_id_fkey" FOREIGN KEY ("floor_id") REFERENCES "building_floors"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "parking_slots" ADD CONSTRAINT "parking_slots_nearest_gate_id_fkey" FOREIGN KEY ("nearest_gate_id") REFERENCES "building_gates"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
