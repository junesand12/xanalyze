import { NextResponse } from "next/server";

const POD_CREDITS_API = "https://podcredits.xandeum.network/api/pods-credits";

export async function GET() {
  try {
    const response = await fetch(POD_CREDITS_API, {
      headers: {
        "Accept": "application/json",
      },
      // Cache for 1 minute
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      console.error("[PodCredits API] Failed:", response.status);
      return NextResponse.json(
        { error: `Failed to fetch pod credits: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[PodCredits API] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
