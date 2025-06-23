// File: app/api/tasks/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
/* eslint-disable @typescript-eslint/no-explicit-any */

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

// --- GET ---
export async function GET(req: NextRequest, context: any) {
  const id = context?.params?.id;

  try {
    const task = await prisma.task.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        dueDate: true,
        isUrgent: true,
        projectId: true,
        subprojectId: true,
        assignedToId: true,
        assignedTo: { select: { id: true, name: true } } // 🟢 Pre-fill for frontend
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('[GET /api/tasks/:id]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// --- PUT ---
export async function PUT(req: NextRequest, context: any) {
  const id = context?.params?.id;
  const data = await req.json();

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await jwtVerify(token, SECRET);

    const updated = await prisma.task.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        isUrgent: data.isUrgent ?? false,
        assignedToId: data.assignedToId ? parseInt(data.assignedToId) : null,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[PUT /api/tasks/:id]', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}
