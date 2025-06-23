// File: app/api/tasks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

// 🔁 In-memory cache
const taskCache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL = 60 * 1000; // 1 minute

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, SECRET);
    const userId = payload.userId as number;
    const role = payload.role as string;

    const { searchParams } = new URL(req.url);

    const projectId = parseInt(searchParams.get('project') || '', 10);
    const subprojectId = searchParams.get('subproject');
    const status = searchParams.get('status') as 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'ON_HOLD' | null;
    const assignedTo = parseInt(searchParams.get('assignedTo') || '', 10);
    const createdBy = parseInt(searchParams.get('createdBy') || '', 10);
    const priority = searchParams.get('priority');
    const date = searchParams.get('date');
    const viewCategory = searchParams.get('viewCategory');
    const excludeCompleted = searchParams.get('excludeCompleted') === 'true';

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    const filters: any[] = [];

    if (role !== 'ADMIN') {
      filters.push({ creatorId: userId });
    }

    if (!isNaN(projectId)) filters.push({ projectId });
    if (subprojectId) filters.push({ subprojectId });
    if (!isNaN(assignedTo)) filters.push({ assignedToId: assignedTo });
    if (!isNaN(createdBy)) filters.push({ creatorId: createdBy });
    if (priority) filters.push({ priority });
    if (excludeCompleted) filters.push({ status: { not: 'DONE' } });
    if (status) filters.push({ status });

    if (viewCategory === 'COMPLETED') {
      filters.push({ status: 'DONE' });
    } else if (viewCategory === 'ON_HOLD') {
      filters.push({ status: 'ON_HOLD' });
    } else if (viewCategory === 'DELAYED') {
      filters.push({ status: { not: 'DONE' } });
      filters.push({ dueDate: { lt: new Date() } });
    }

    if (date) {
      const parsed = new Date(date);
      parsed.setHours(23, 59, 59, 999);
      filters.push({ dueDate: { lte: parsed } });
    }

    const where = filters.length > 0 ? { AND: filters } : {};

    // 🔐 Cache lookup
    const cacheKey = `tasks:${JSON.stringify({ where, skip, limit })}`;
    const now = Date.now();
    const cached = taskCache.get(cacheKey);
    if (cached && now < cached.expiry) {
      return NextResponse.json({ ...cached.data, cached: true });
    }

    // 🚀 Fetch from DB
    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { dueDate: 'asc' },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          dueDate: true,
          priority: true,
          isUrgent: true,
          project: { select: { title: true } },
          subproject: { select: { name: true } },
          assignedTo: { select: { name: true } },
          creator: { select: { name: true } },
        },
      }),
      prisma.task.count({ where }),
    ]);

    // 💾 Cache the result
    const result = { tasks, total, page, limit };
    taskCache.set(cacheKey, {
      data: result,
      expiry: now + CACHE_TTL,
    });

    // ✅ Return fresh response
    return NextResponse.json(result);
  } catch (error) {
    console.error('[API /tasks GET] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
