// File: app/api/milestones/[id]/route.ts

import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const { status } = await req.json();

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const updatedMilestone = await prisma.milestone.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updatedMilestone);
  } catch (error) {
    console.error('Error updating milestone status:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
