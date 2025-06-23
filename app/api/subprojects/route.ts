//File: api/subprojects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { name, createdAt, projectId } = await req.json();

    if (!name || !createdAt || !projectId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const subproject = await prisma.subProject.create({
      data: {
        name,
        createdAt: new Date(createdAt),
        project: {
          connect: { id: Number(projectId) },
        },
      },
    });

    return NextResponse.json(subproject, { status: 201 });
  } catch (error) {
    console.error('[POST /api/subprojects]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const projectId = req.nextUrl.searchParams.get('projectId');

  if (!projectId) {
    return NextResponse.json([], { status: 200 }); // ✅ Return empty array instead of error
  }

  try {
    const subprojects = await prisma.subProject.findMany({
      where: { projectId: Number(projectId) },
      orderBy: { createdAt: 'desc' },
    });

    // ✅ Always return an array
    return NextResponse.json({
      subprojects,
      total: subprojects.length, // 👍 helpful for pagination later
    });
  } catch (error) {
    console.error('[GET /api/projects/subprojects]', error);
    return NextResponse.json([], { status: 200 }); // ✅ Even on error, fallback to array
  }
}

