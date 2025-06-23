// File: app/api/categories/[id]/route.ts
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

// ✅ Auth function (reads token from cookies)
async function authenticateAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return { error: 'No token provided', status: 401 };
  }

  try {
    const { payload } = await jwtVerify(token, SECRET);
    if (payload.role !== 'ADMIN') {
      return { error: 'Forbidden: Admins only', status: 403 };
    }
    return { payload };
  } catch {
    return { error: 'Invalid token', status: 401 };
  }
}

// ✅ DELETE: Remove category if not used
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await authenticateAdmin();
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const usageCount = await prisma.costItem.count({
      where: { categoryId: params.id },
    });

    if (usageCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category because it is used in cost entries.' },
        { status: 400 }
      );
    }

    await prisma.category.delete({ where: { id: params.id } });

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('[DELETE /api/categories/[id]] error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// ✅ PUT: Update category name
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await authenticateAdmin();
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const data = await req.json();

    if (!data.name || typeof data.name !== 'string') {
      return NextResponse.json({ error: 'Invalid category name' }, { status: 400 });
    }

    const updated = await prisma.category.update({
      where: { id: params.id },
      data: { name: data.name },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('PUT /api/categories/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}
