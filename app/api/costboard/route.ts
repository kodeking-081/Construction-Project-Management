// File: app/api/costboard/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    const subprojectId = searchParams.get('subprojectId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const filters: any = {};
    if (projectId) filters.projectId = parseInt(projectId);
    if (subprojectId) filters.subprojectId = subprojectId;

    const [items, total] = await Promise.all([
      prisma.costItem.findMany({
        where: filters,
        skip,
        take: limit,
        include: {
          category: { select: { name: true } },
          project: { select: { title: true } },
          subproject: { select: { name: true } },
        },
        orderBy: { date: 'desc' },
      }),
      prisma.costItem.count({ where: filters }),
    ]);

    return NextResponse.json({ items, total, page, limit });
  } catch (error) {
    console.error('[API] Failed to fetch cost items:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
