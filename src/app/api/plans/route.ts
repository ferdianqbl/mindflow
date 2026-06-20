import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/auth";
import { cookies } from "next/headers";

// Helper function to authenticate the user using cookies
async function authenticate() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return { error: "Unauthorized: Missing session token", status: 401 };
    }
    
    const user = await verifyJWT(token);
    if (!user) {
      return { error: "Unauthorized: Invalid or expired session token", status: 401 };
    }
    
    return { user };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { error: `Authentication system failure: ${message}`, status: 500 };
  }
}

// GET /api/plans - Fetch all active (incomplete) plans
export async function GET(req: NextRequest) {
  const auth = await authenticate();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const user = auth.user!;

  try {
    const plans = await prisma.taskPlan.findMany({
      where: { userId: user.id, isCompleted: false },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ plans });
  } catch (dbError) {
    const message = dbError instanceof Error ? dbError.message : String(dbError);
    return NextResponse.json({ error: `Database query failure: ${message}` }, { status: 500 });
  }
}

// POST /api/plans - Sync plans for the current session (replace active plans)
export async function POST(req: NextRequest) {
  const auth = await authenticate();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const user = auth.user!;

  try {
    const body = await req.json().catch(() => ({}));
    const { plans } = body;

    if (!Array.isArray(plans)) {
      return NextResponse.json({ error: "Plans must be an array of task plans" }, { status: 400 });
    }

    // Validate plans
    const validCategories = ["coding", "debugging", "design", "learning", "meeting", "operations"];
    for (const plan of plans) {
      if (!plan.title || typeof plan.title !== "string" || plan.title.trim().length === 0) {
        return NextResponse.json({ error: "Each plan must have a non-empty title" }, { status: 400 });
      }
      if (plan.title.length > 140) {
        return NextResponse.json({ error: "Plan title must not exceed 140 characters" }, { status: 400 });
      }
      const formattedCategory = (plan.category || "").toLowerCase();
      if (!validCategories.includes(formattedCategory)) {
        return NextResponse.json({ 
          error: `Category must be one of the following: ${validCategories.join(", ")}` 
        }, { status: 400 });
      }
      const duration = parseInt(plan.durationMin, 10);
      if (isNaN(duration) || duration <= 0) {
        return NextResponse.json({ error: "Each plan must have a positive duration in minutes" }, { status: 400 });
      }
    }

    // Execute in a transaction: delete old incomplete plans, insert new ones
    const result = await prisma.$transaction(async (tx) => {
      // 1. Delete all incomplete plans for the user
      await tx.taskPlan.deleteMany({
        where: { userId: user.id, isCompleted: false },
      });

      // 2. Create the new plans
      const createdPlans = [];
      for (const p of plans) {
        const created = await tx.taskPlan.create({
          data: {
            userId: user.id,
            category: p.category.toLowerCase(),
            title: p.title.trim(),
            durationMin: parseInt(p.durationMin, 10),
            isCompleted: false,
          },
        });
        createdPlans.push(created);
      }
      return createdPlans;
    });

    return NextResponse.json({ plans: result }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Failed to sync plans: ${message}` }, { status: 500 });
  }
}
