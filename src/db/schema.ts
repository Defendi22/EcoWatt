import { pgTable, serial, text, real, integer, timestamp } from "drizzle-orm/pg-core";

export const energyRecords = pgTable("energy_records", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().default("default"),
  month: integer("month").notNull(), // 1-12
  year: integer("year").notNull(),
  kwh: real("kwh").notNull(),
  valueReais: real("value_reais").notNull(),
  region: text("region").notNull(), // Norte, Nordeste, Sudeste, Sul, Centro-Oeste
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type EnergyRecord = typeof energyRecords.$inferSelect;
export type NewEnergyRecord = typeof energyRecords.$inferInsert;
