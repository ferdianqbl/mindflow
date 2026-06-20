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

// POST /api/plans/validate - Validate completed and incomplete tasks
export async function POST(req: NextRequest) {
  const auth = await authenticate();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const user = auth.user!;

  try {
    const body = await req.json().catch(() => ({}));
    const { completedPlanIds } = body;

    if (!Array.isArray(completedPlanIds)) {
      return NextResponse.json({ error: "completedPlanIds must be an array of string IDs" }, { status: 400 });
    }

    // Process validations in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch completed plans to copy details to FocusLog
      const completedPlans = await tx.taskPlan.findMany({
        where: {
          id: { in: completedPlanIds },
          userId: user.id,
          isCompleted: false,
        },
      });

      // 2. Mark them as completed in TaskPlan
      if (completedPlanIds.length > 0) {
        await tx.taskPlan.updateMany({
          where: {
            id: { in: completedPlanIds },
            userId: user.id,
          },
          data: {
            isCompleted: true,
          },
        });
      }

      // 3. Create FocusLog entries for each completed plan
      const createdLogs = [];
      for (const plan of completedPlans) {
        const log = await tx.focusLog.create({
          data: {
            userId: user.id,
            category: plan.category,
            description: plan.title,
            durationMinutes: plan.durationMin,
          },
        });
        createdLogs.push(log);
      }

      return {
        completedCount: completedPlans.length,
        logs: createdLogs,
      };
    });

    return NextResponse.json({
      message: "Session tasks validated successfully",
      ...result,
    }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Failed to validate session tasks: ${message}` }, { status: 500 });
  }
}
