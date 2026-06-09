-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "feedbacks" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID,
    "parking_session_id" UUID,
    "issue_type" VARCHAR(50) NOT NULL,
    "description" TEXT NOT NULL,
    "status" VARCHAR(20) DEFAULT 'OPEN',
    "reply" TEXT,
    "reply_created_at" TIMESTAMPTZ(6),
    "resolved_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parking_sessions" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "ticket_code" VARCHAR(50),
    "license_plate" VARCHAR(20) NOT NULL,
    "vehicle_type_id" UUID,
    "user_id" UUID,
    "parking_slot_id" UUID,
    "assigned_slot_id" UUID,
    "entry_gate" VARCHAR(50),
    "exit_gate" VARCHAR(50),
    "entry_time" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "exit_time" TIMESTAMPTZ(6),
    "checkin_staff_id" UUID,
    "checkout_staff_id" UUID,
    "status" VARCHAR(20) DEFAULT 'ACTIVE',

    CONSTRAINT "parking_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parking_slots" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "zone_id" UUID,
    "slot_name" VARCHAR(20) NOT NULL,
    "status" VARCHAR(20) DEFAULT 'AVAILABLE',
    "distance_to_gate" INTEGER DEFAULT 0,

    CONSTRAINT "parking_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "parking_session_id" UUID,
    "reservation_id" UUID,
    "amount" DECIMAL(10,2) NOT NULL,
    "payment_method" VARCHAR(20) NOT NULL,
    "payment_time" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "status" VARCHAR(20) DEFAULT 'PENDING',
    "sepay_payment_code" VARCHAR(50),
    "sepay_transaction_id" VARCHAR(50),
    "sepay_reference_code" VARCHAR(100),
    "sepay_payload" JSONB,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_policies" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "vehicle_type_id" UUID,
    "base_price" DECIMAL(10,2) NOT NULL,
    "hourly_rate" DECIMAL(10,2) DEFAULT 0,
    "night_rate" DECIMAL(10,2) DEFAULT 0,
    "effective_date" DATE NOT NULL,

    CONSTRAINT "pricing_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservations" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "vehicle_type_id" UUID NOT NULL,
    "parking_slot_id" UUID,
    "expected_start_time" TIMESTAMPTZ(6) NOT NULL,
    "expected_end_time" TIMESTAMPTZ(6) NOT NULL,
    "status" VARCHAR(20) DEFAULT 'CONFIRMED',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_configs" (
    "config_key" VARCHAR(50) NOT NULL,
    "config_value" TEXT NOT NULL,
    "description" TEXT,
    "updated_by" UUID,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_configs_pkey" PRIMARY KEY ("config_key")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "username" VARCHAR(50) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100),
    "phone" VARCHAR(20),
    "role" VARCHAR(20) NOT NULL,
    "status" VARCHAR(20) DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_types" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "type_name" VARCHAR(50) NOT NULL,
    "description" TEXT,

    CONSTRAINT "vehicle_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zones" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "zone_name" VARCHAR(50) NOT NULL,
    "vehicle_type_id" UUID,
    "total_capacity" INTEGER NOT NULL,

    CONSTRAINT "zones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "parking_sessions_ticket_code_key" ON "parking_sessions"("ticket_code");

-- CreateIndex
CREATE UNIQUE INDEX "parking_slots_zone_id_slot_name_key" ON "parking_slots"("zone_id", "slot_name");

-- CreateIndex
CREATE UNIQUE INDEX "payments_sepay_payment_code_key" ON "payments"("sepay_payment_code");

-- CreateIndex
CREATE UNIQUE INDEX "payments_sepay_transaction_id_key" ON "payments"("sepay_transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "pricing_policies_vehicle_type_id_effective_date_key" ON "pricing_policies"("vehicle_type_id", "effective_date");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_types_type_name_key" ON "vehicle_types"("type_name");

-- AddForeignKey
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_parking_session_id_fkey" FOREIGN KEY ("parking_session_id") REFERENCES "parking_sessions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "parking_sessions" ADD CONSTRAINT "parking_sessions_assigned_slot_id_fkey" FOREIGN KEY ("assigned_slot_id") REFERENCES "parking_slots"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "parking_sessions" ADD CONSTRAINT "parking_sessions_checkin_staff_id_fkey" FOREIGN KEY ("checkin_staff_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "parking_sessions" ADD CONSTRAINT "parking_sessions_checkout_staff_id_fkey" FOREIGN KEY ("checkout_staff_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "parking_sessions" ADD CONSTRAINT "parking_sessions_parking_slot_id_fkey" FOREIGN KEY ("parking_slot_id") REFERENCES "parking_slots"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "parking_sessions" ADD CONSTRAINT "parking_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "parking_sessions" ADD CONSTRAINT "parking_sessions_vehicle_type_id_fkey" FOREIGN KEY ("vehicle_type_id") REFERENCES "vehicle_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "parking_slots" ADD CONSTRAINT "parking_slots_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "zones"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_parking_session_id_fkey" FOREIGN KEY ("parking_session_id") REFERENCES "parking_sessions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "reservations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pricing_policies" ADD CONSTRAINT "pricing_policies_vehicle_type_id_fkey" FOREIGN KEY ("vehicle_type_id") REFERENCES "vehicle_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_parking_slot_id_fkey" FOREIGN KEY ("parking_slot_id") REFERENCES "parking_slots"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_vehicle_type_id_fkey" FOREIGN KEY ("vehicle_type_id") REFERENCES "vehicle_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "system_configs" ADD CONSTRAINT "system_configs_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "zones" ADD CONSTRAINT "zones_vehicle_type_id_fkey" FOREIGN KEY ("vehicle_type_id") REFERENCES "vehicle_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
