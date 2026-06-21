import { PrismaClient } from './generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function seedUser(userId: string, email: string, hashedPassword: string) {
  console.log(`Upserting user: ${email}...`);
  await prisma.user.upsert({
    where: { email },
    update: { password: hashedPassword },
    create: {
      id: userId,
      email,
      password: hashedPassword,
    },
  });

  console.log(`Clearing old logs and plans for ${email}...`);
  await prisma.focusLog.deleteMany({ where: { userId } });
  await prisma.taskPlan.deleteMany({ where: { userId } });
  await prisma.copyLog.deleteMany({ where: { userId } });

  console.log(`Creating task plans for ${email}...`);
  const taskPlans = [
    { category: 'coding', title: `Refactor ${email.split('@')[0]}'s dashboard API client`, durationMin: 25 },
    { category: 'design', title: 'Polish custom SVG stats donut charts and animations', durationMin: 20 },
    { category: 'learning', title: 'Review authentication headers proxy middleware cookies', durationMin: 15 },
  ];

  for (const plan of taskPlans) {
    await prisma.taskPlan.create({
      data: {
        userId,
        category: plan.category,
        title: plan.title,
        durationMin: plan.durationMin,
        isCompleted: false,
      },
    });
  }

  console.log(`Creating focus logs for ${email}...`);
  const logsData = [
    { category: 'coding', description: 'Scaffolded Next.js layout and routing structures' },
    { category: 'design', description: 'Designed neon glow Pomodoro circular dial SVG' },
    { category: 'learning', description: 'Researched Supabase Realtime Presence broadcast API' },
    { category: 'coding', description: 'Integrated Supabase presence into Lounge user lists' },
    { category: 'debugging', description: 'Fixed local storage lag in timer countdown state' },
    { category: 'operations', description: 'Configured Prisma adapter-pg connection pools' },
    { category: 'meeting', description: 'Reviewed PRD planning milestones with the team' },
    { category: 'coding', description: 'Implemented focus accomplishment validator modal' },
    { category: 'design', description: 'Polished stats donut chart segment calculations' },
    { category: 'debugging', description: 'Resolved JWT cookies expiration verification bugs' },
    { category: 'learning', description: 'Learned Tailwind post-css configuration rules' },
    { category: 'coding', description: 'Created Standup text templates and copy button' },
    { category: 'operations', description: 'Deployed staging app version to Vercel' },
    { category: 'coding', description: 'Centralized state management with Zustand store' },
    { category: 'debugging', description: 'Fixed lounge active timer clock ticks syncer' },
    { category: 'coding', description: 'Added Clipboard Copy analytics routes and table' },
  ];

  // Distribute these logs over the last 14 days to make the charts and heatmaps look realistic
  const now = new Date();
  for (let i = 0; i < logsData.length; i++) {
    const log = logsData[i];
    // Subtract days: distribute logs across the last 14 days
    const logDate = new Date(now);
    const daysOffset = Math.floor(i / 1.5); // spread out
    logDate.setDate(now.getDate() - daysOffset);
    // Randomize hours to make it look realistic
    logDate.setHours(9 + (i % 8), (i * 7) % 60, 0, 0);

    await prisma.focusLog.create({
      data: {
        userId,
        category: log.category,
        description: log.description,
        durationMinutes: 25 + ((i * 5) % 15), // 25, 30, 35 mins
        createdAt: logDate,
      },
    });
  }

  // Create copy logs (clipboard copy analytics)
  console.log(`Creating copy logs for ${email}...`);
  const formats = ['slack', 'ytb', 'markdown'];
  for (let i = 0; i < 8; i++) {
    const logDate = new Date(now);
    logDate.setDate(now.getDate() - Math.floor(i / 2));
    logDate.setHours(10 + (i % 6), (i * 12) % 60, 0, 0);

    await prisma.copyLog.create({
      data: {
        userId,
        format: formats[i % formats.length],
        createdAt: logDate,
      },
    });
  }
}

async function main() {
  const hashedPassword = bcrypt.hashSync('Password123', 10);

  const users = [
    { id: '3e8a4d70-3c10-4bc3-95ad-29a32c695dbf', email: 'demo@mindflow.io' },
    { id: '8a8b1c41-86e5-4122-bd55-22d7c07b0e12', email: 'owen@mindflow.io' },
    { id: '1b9c3d4f-56a8-4e12-b13c-74a98d36fb21', email: 'alice@mindflow.io' },
  ];

  for (const u of users) {
    await seedUser(u.id, u.email, hashedPassword);
  }

  console.log('All database users seeded successfully!');
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('Error seeding database:', err);
  process.exit(1);
});
