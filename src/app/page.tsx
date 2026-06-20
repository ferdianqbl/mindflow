import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardClient from "@/components/dashboard-client";
import { FocusLogItem } from "@/components/timeline";

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  
  // 1. Verify custom JWT User Session on Server
  let user = null;
  if (token) {
    user = await verifyJWT(token);
  }

  if (!user) {
    redirect("/login");
  }

  let formattedLogs: FocusLogItem[] = [];

  try {
    // 2. Retrieve focus logs from local PostgreSQL using the JWT user id
    const initialLogs = await prisma.focusLog.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    // 3. Map DB date objects to serializable string timestamps for the client layout
    formattedLogs = initialLogs.map((log) => ({
      id: log.id,
      category: log.category,
      description: log.description,
      durationMinutes: log.durationMinutes,
      createdAt: log.createdAt.toISOString(),
    }));
  } catch (dbError) {
    console.error("Prisma Server-Component logs fetch failed:", dbError);
    formattedLogs = [];
  }

  return <DashboardClient user={user} initialLogs={formattedLogs} />;
}
