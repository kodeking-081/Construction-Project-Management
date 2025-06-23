//File /api/categories/route.ts:
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

async function authenticateAdmin(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');

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
    return { error: 'Invalid token', status: 401, err };
  }
}

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('[GET /api/categories]', error);
    return NextResponse.json({ error: 'Failed to load categories' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await authenticateAdmin(req);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Invalid category name' }, { status: 400 });
    }

    const newCategory = await prisma.category.create({ data: { name } });
    return NextResponse.json(newCategory);
  } catch (error) {
    console.error('[POST /api/categories]', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
