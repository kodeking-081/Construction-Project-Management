import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      itemName,
      floorPhase,
      contractor,
      date,
      estimatedCost,
      actualCost,
      status, // enum: Pending | Approved | Paid | OnHold | Cancelled
      categoryId,
      projectId,
      subprojectId, // optional, String
    } = body;

    // Basic field validation
    if (!itemName || !date || !estimatedCost || !status || !categoryId || !projectId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate projectId (should be Int)
    const parsedProjectId = typeof projectId === 'string' ? parseInt(projectId) : projectId;
    if (isNaN(parsedProjectId)) {
      return NextResponse.json({ error: 'Invalid projectId' }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id: parsedProjectId },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Validate subprojectId only if present
    let validSubprojectId: string | null = null;
    if (subprojectId !== undefined && subprojectId !== null && subprojectId !== '') {
      if (typeof subprojectId !== 'string') {
        return NextResponse.json({ error: 'Invalid subprojectId format' }, { status: 400 });
      }

      const subproject = await prisma.subProject.findUnique({
        where: { id: subprojectId },
      });

      if (!subproject) {
        return NextResponse.json({ error: 'Subproject not found' }, { status: 404 });
      }

      validSubprojectId = subprojectId;
    }

    // Validate categoryId (must be string, already is from frontend)
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Create the cost item
    const newCostItem = await prisma.costItem.create({
      data: {
        itemName,
        floorPhase,
        contractor,
        date: new Date(date),
        estimatedCost: parseFloat(estimatedCost),
        actualCost: actualCost ? parseFloat(actualCost) : null,
        status, // Must match enum exactly: Pending | Approved | Paid | OnHold | Cancelled
        categoryId,
        projectId: parsedProjectId,
        subprojectId: validSubprojectId,
      },
    });

    return NextResponse.json(
      { message: 'Cost item created', costItem: newCostItem },
      { status: 201 }
    );
  } catch (error) {
    console.error('[COST_ENTRY_POST]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
