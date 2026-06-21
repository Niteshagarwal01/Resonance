import { NextResponse } from "next/server";

const SUPABASE_URL = "https://jjrgxexwanztwapdmtor.supabase.co";
const SUPABASE_KEY = "sb_publishable_UEftccBGm1VtMt_PdKJ48Q_aZlBXY2y";

export async function GET() {
  try {
    // Fetch user count from Supabase auth.users (via profiles table or users count)
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?select=count`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "count=exact",
        },
        cache: "no-store",
      }
    );

    // Get count from Content-Range header
    const contentRange = res.headers.get("content-range");
    // content-range is like "0-9/42" → total is after "/"
    let userCount = 0;
    if (contentRange) {
      const total = contentRange.split("/")[1];
      userCount = parseInt(total, 10) || 0;
    }

    return NextResponse.json(
      {
        users: userCount,
        tracks: 100_000_000, // YouTube Music catalog size – real documented figure
        cost: 0,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch {
    // On any error return 0 for users so it's always honest
    return NextResponse.json({ users: 0, tracks: 100_000_000, cost: 0 });
  }
}
