import { NextRequest, NextResponse } from "next/server";
import { nextSlots } from "../../../../lib/scheduler";

export async function POST(req: NextRequest) {
  const { daysOfWeek, timeOfDay, startDate, count } = await req.json();
  const slots = nextSlots({ daysOfWeek, timeOfDay, startDate, count });
  return NextResponse.json({ slots });
}


