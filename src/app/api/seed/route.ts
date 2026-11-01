import { NextResponse } from "next/server";
import { seedDatabase } from "@/server/lib/seed";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await seedDatabase();
    return NextResponse.json({
      success: true,
      message: "WorkWasl demo database seeded successfully!",
      result,
    });
  } catch (error: unknown) {
    console.error("API Seed Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to seed database",
      },
      { status: 500 },
    );
  }
}

export async function POST() {
  return GET();
}
