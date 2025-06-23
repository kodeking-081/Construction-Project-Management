// File: app/api/save-cost-report/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const body = await req.json();

  const userId = parseInt(body.userId);
  const projectId = parseInt(body.projectId);
  const subprojectId = body.subprojectId;
  const publicId = body.public_id;
  const url = body.url;
  const originalFilename = body.original_filename;
  const format = body.format;

  if (
    !publicId || !url || !originalFilename || !format ||
    isNaN(userId) || isNaN(projectId) || !subprojectId
  ) {
    return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
  }

  try {
    const saved = await prisma.costReport.create({
      data: {
        publicId,
        url,
        originalFilename,
        format,
        uploadedById: userId,
        projectId,
        subprojectId,
      },
    });
    return NextResponse.json(saved);
  } catch (err) {
    console.error('❌ Failed to save cost report:', err);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
