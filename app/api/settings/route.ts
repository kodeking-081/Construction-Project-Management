// File: app/api/settings/route.ts
// File: app/api/settings/route.ts
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export async function PUT(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'No token provided' }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token, SECRET);
    const userId = payload.userId as number;

    const { name, email, contact, password } = await req.json();

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
        contact,
        ...(password ? { password } : {}),
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error('[PUT /api/settings] Error:', err);
    return NextResponse.json({ error: 'Invalid token or update failed' }, { status: 401 });
  }
}

