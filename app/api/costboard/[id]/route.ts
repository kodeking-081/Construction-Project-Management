// File: app/api/costboard/[id]/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const costItem = await prisma.costItem.findUnique({
      where: { id },
    });

    if (!costItem) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(costItem);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch entry' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.costItem.delete({ where: { id: params.id } });
    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    const updated = await prisma.costItem.update({
      where: { id: params.id },
      data: {
        itemName: data.itemName,
        floorPhase: data.floorPhase,
        contractor: data.contractor,
        date: new Date(data.date),
        estimatedCost: data.estimatedCost,
        actualCost: data.actualCost,
        status: data.status,
        categoryId: data.categoryId,
        notes: data.notes,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 });
  }
}
