import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

// Helper function to authenticate the user using cookies
async function authenticate() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return { error: 'Unauthorized: Missing session token', status: 401 };
    }
    
    const user = await verifyJWT(token);
    if (!user) {
      return { error: 'Unauthorized: Invalid or expired session token', status: 401 };
    }
    
    return { user };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { error: `Authentication system failure: ${message}`, status: 500 };
  }
}

// POST /api/logs/copy - Log a "Copy Report" action
export async function POST(req: NextRequest) {
  const auth = await authenticate();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const user = auth.user!;

  try {
    const body = await req.json().catch(() => ({}));
    const { format } = body;

    // Validation checks
    if (!format || typeof format !== 'string') {
      return NextResponse.json({ error: 'Format is required and must be a string' }, { status: 400 });
    }

    const validFormats = ['slack', 'ytb', 'markdown'];
    const formattedFormat = format.toLowerCase().trim();
    if (!validFormats.includes(formattedFormat)) {
      return NextResponse.json({ 
        error: `Format must be one of the following: ${validFormats.join(', ')}` 
      }, { status: 400 });
    }

    // Create copy log record
    const log = await prisma.copyLog.create({
      data: {
        userId: user.id,
        format: formattedFormat,
      },
    });

    return NextResponse.json({ success: true, log }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Failed to create copy log: ${message}` }, { status: 500 });
  }
}
