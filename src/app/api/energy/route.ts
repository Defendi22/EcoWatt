import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { energyRecords } from "@/db/schema";
import { desc, eq, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "default";

    const records = await db
      .select()
      .from(energyRecords)
      .where(eq(energyRecords.userId, userId))
      .orderBy(desc(energyRecords.year), desc(energyRecords.month));

    return NextResponse.json({ records });
  } catch (error) {
    console.error("GET /api/energy error:", error);
    return NextResponse.json({ error: "Erro ao buscar registros" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId = "default", month, year, kwh, valueReais, region, notes } = body;

    if (!month || !year || !kwh || !valueReais || !region) {
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
    }

    // Check if record for this month/year/user already exists
    const existing = await db
      .select()
      .from(energyRecords)
      .where(
        and(
          eq(energyRecords.userId, userId),
          eq(energyRecords.month, Number(month)),
          eq(energyRecords.year, Number(year))
        )
      );

    let record;
    if (existing.length > 0) {
      // Update
      const updated = await db
        .update(energyRecords)
        .set({ kwh: Number(kwh), valueReais: Number(valueReais), region, notes })
        .where(eq(energyRecords.id, existing[0].id))
        .returning();
      record = updated[0];
    } else {
      // Insert
      const inserted = await db
        .insert(energyRecords)
        .values({ userId, month: Number(month), year: Number(year), kwh: Number(kwh), valueReais: Number(valueReais), region, notes })
        .returning();
      record = inserted[0];
    }

    return NextResponse.json({ record });
  } catch (error) {
    console.error("POST /api/energy error:", error);
    return NextResponse.json({ error: "Erro ao salvar registro" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });

    await db.delete(energyRecords).where(eq(energyRecords.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/energy error:", error);
    return NextResponse.json({ error: "Erro ao deletar registro" }, { status: 500 });
  }
}
