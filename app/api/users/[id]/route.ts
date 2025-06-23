// File: app/api/users/[id]/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id, 10);
    const deleted = await prisma.user.delete({ where: { id: userId } });
    return NextResponse.json(deleted);
  } catch (error) {
    console.error(`[DELETE /api/users/${params.id}]`, error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
