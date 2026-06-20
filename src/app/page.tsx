import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import DashboardClient from "@/components/dashboard-client";
import { FocusLogItem } from "@/components/timeline";

export default async function HomePage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  // 1. Verify User Session on Server
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    redirect("/login");
  }

  try {
    // 2. Self-healing check: Sync user record inside PostgreSQL user table
    await prisma.user.upsert({
      where: { id: user.id },
      update: { email: user.email! },
      create: { id: user.id, email: user.email! },
    });

    // 3. Retrieve focus logs
    const initialLogs = await prisma.focusLog.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    // 4. Map DB date objects to serializable string timestamps for client component
    const formattedLogs: FocusLogItem[] = initialLogs.map((log) => ({
      id: log.id,
      category: log.category,
      description: log.description,
      durationMinutes: log.durationMinutes,
      createdAt: log.createdAt.toISOString(),
    }));

    return <DashboardClient user={user} initialLogs={formattedLogs} />;
  } catch (dbError) {
    console.error("Prisma Server-Component fetch failed:", dbError);
    // Fallback to client layout with empty logs if db is temporarily unresponsive
    return <DashboardClient user={user} initialLogs={[]} />;
  }
}
