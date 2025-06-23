// File: app/api/cost-reports/route.ts
// File: app/api/cost-reports/route.ts

import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const projectId = searchParams.get('projectId');
    const subprojectId = searchParams.get('subprojectId');
    const uploadedBy = searchParams.get('uploadedBy');
    const fromDate = searchParams.get('fromDate'); // e.g. '2024-01-01'
    const toDate = searchParams.get('toDate');     // e.g. '2024-12-31'
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    if (!projectId || !subprojectId) {
      return NextResponse.json(
        { error: 'Missing projectId or subprojectId' },
        { status: 400 }
      );
    }

    const filters: any = {
      projectId: Number(projectId),
      subprojectId: subprojectId,
    };

    if (uploadedBy) {
      filters.uploadedById = Number(uploadedBy);
    }

    if (fromDate || toDate) {
      filters.uploadedAt = {};
      if (fromDate) filters.uploadedAt.gte = new Date(fromDate);
      if (toDate) filters.uploadedAt.lte = new Date(toDate);
    }

    const [reports, totalCount] = await Promise.all([
      prisma.costReport.findMany({
        where: filters,
        orderBy: { uploadedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.costReport.count({ where: filters }),
    ]);

    return NextResponse.json({
      reports,
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (err) {
    console.error('❌ Error fetching cost reports:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
