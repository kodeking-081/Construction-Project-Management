// File: app/api/users/route.ts
// File: app/api/users/route.ts
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

async function authenticateAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value; // ✅ extract token from cookie

  if (!token) {
    return { error: 'No token provided', status: 401 };
  }

  try {
    const { payload } = await jwtVerify(token, SECRET);
    if (payload.role !== 'ADMIN') {
      return { error: 'Forbidden: Admins only', status: 403 };
    }
    return { payload };
  } catch (err) {
    return { error: 'Invalid token', status: 401 };
  }
}

export async function GET(req: NextRequest) {
  const auth = await authenticateAdmin();
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search')?.toLowerCase();

  try {
    const users = await prisma.user.findMany({
      where: search
        ? {
            name: {
              contains: search,
              mode: 'insensitive', // case-insensitive match
            },
          }
        : {},
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('[GET /api/users]', error);
    return NextResponse.json({ error: 'Failed to load users' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await authenticateAdmin();
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { name, email, password, contact, role = 'USER' } = await req.json();

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password, // 🔒 hash in production
        contact,
        role,
      },
    });

    return NextResponse.json(newUser);
  } catch (error) {
    console.error('[POST /api/users]', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
