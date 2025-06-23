// File: app/api/milestones/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { title, dueDate, status, projectId } = await req.json();

    if (!title || !dueDate || !status || !projectId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const milestone = await prisma.milestone.create({
      data: {
        title,
        dueDate: new Date(dueDate),
        status,
        project: {
          connect: { id: Number(projectId) },
        },
      },
    });

    return NextResponse.json(milestone, { status: 201 });
  } catch (error) {
    console.error('[POST /api/milestones]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
