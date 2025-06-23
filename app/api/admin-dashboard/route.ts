// File: app/api/admin-dashboard/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: No token' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, SECRET);
    const role = payload.role as string;

    if (role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Insufficient privileges' }, { status: 403 });
    }

    const [totalProjects, totalTasks, totalUsers, totalCostItems] = await Promise.all([
      prisma.project.count(),
      prisma.task.count(),
      prisma.user.count(),
      prisma.costItem.count(),
    ]);

    const totalEstimatedCost = await prisma.costItem.aggregate({ _sum: { estimatedCost: true } });
    const totalActualCost = await prisma.costItem.aggregate({ _sum: { actualCost: true } });

    return NextResponse.json({
      totalProjects,
      totalTasks,
      totalUsers,
      totalCostItems,
      totalEstimatedCost: totalEstimatedCost._sum.estimatedCost || 0,
      totalActualCost: totalActualCost._sum.actualCost || 0,
    });
  } catch (error) {
    console.error('[ADMIN_DASHBOARD_ROUTE_ERROR]', error);
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

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
    console.error('[PUT /api/admin-dashboard] Error:', err);
    return NextResponse.json({ error: 'Invalid token or update failed' }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, SECRET);
    if (payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { name } = await req.json();
    if (!name) {
      return NextResponse.json({ error: 'Missing category name' }, { status: 400 });
    }

    const category = await prisma.category.create({ data: { name } });
    return NextResponse.json(category);
  } catch (err) {
    console.error('[POST /api/admin-dashboard] Error:', err);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
