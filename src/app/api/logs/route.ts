import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/prisma';
import { supabase } from '@/utils/supabase';

// Helper function to authenticate the Bearer JWT token from request headers
async function authenticate(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return { error: 'Missing authorization header', status: 401 };
  }

  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    return { error: 'Invalid authorization token format', status: 401 };
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return { error: `Unauthorized: ${error?.message || 'Invalid token'}`, status: 401 };
    }
    return { user };
  } catch (err: any) {
    return { error: `Authentication system failure: ${err.message}`, status: 500 };
  }
}

// GET /api/logs - Fetch all focus logs for the authenticated user
export async function GET(req: NextRequest) {
  const auth = await authenticate(req);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const user = auth.user!;

  try {
    // Self-healing check: Sync user in PostgreSQL table if missing
    await prisma.user.upsert({
      where: { id: user.id },
      update: { email: user.email! },
      create: { id: user.id, email: user.email! },
    });

    // Retrieve all logs ordered by creation timestamp
    const logs = await prisma.focusLog.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ logs });
  } catch (dbError: any) {
    return NextResponse.json({ error: `Database query failure: ${dbError.message}` }, { status: 500 });
  }
}

// POST /api/logs - Save a completed focus session log
export async function POST(req: NextRequest) {
  const auth = await authenticate(req);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const user = auth.user!;

  try {
    const body = await req.json().catch(() => ({}));
    const { category, description, durationMinutes } = body;

    // Validation checks
    if (!description || typeof description !== 'string') {
      return NextResponse.json({ error: 'Description is required and must be a string' }, { status: 400 });
    }

    if (description.trim().length === 0) {
      return NextResponse.json({ error: 'Description cannot be empty' }, { status: 400 });
    }

    if (description.length > 140) {
      return NextResponse.json({ error: 'Description must not exceed 140 characters' }, { status: 400 });
    }

    const validCategories = ['coding', 'debugging', 'design', 'learning', 'meeting', 'operations'];
    const formattedCategory = (category || '').toLowerCase();
    if (!validCategories.includes(formattedCategory)) {
      return NextResponse.json({ 
        error: `Category must be one of the following: ${validCategories.join(', ')}` 
      }, { status: 400 });
    }

    const parsedDuration = parseInt(durationMinutes, 10);
    const duration = isNaN(parsedDuration) || parsedDuration <= 0 ? 25 : parsedDuration;

    // Self-healing check: Sync user in PostgreSQL table if missing
    await prisma.user.upsert({
      where: { id: user.id },
      update: { email: user.email! },
      create: { id: user.id, email: user.email! },
    });

    // Create log record
    const log = await prisma.focusLog.create({
      data: {
        userId: user.id,
        category: formattedCategory,
        description: description.trim(),
        durationMinutes: duration,
      },
    });

    return NextResponse.json({ log }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: `Failed to create log: ${error.message}` }, { status: 500 });
  }
}
