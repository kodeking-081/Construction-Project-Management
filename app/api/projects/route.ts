// File: app/api/projects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

// 🔐 Auth from cookies instead of Authorization header
async function authenticateAdminFromCookies() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return { error: 'Unauthorized: No token in cookies', status: 401 };
  }

  try {
    const { payload } = await jwtVerify(token, SECRET);
    if (payload.role !== 'ADMIN') {
      return { error: 'Forbidden: Admins only', status: 403 };
    }
    return { payload };
  } catch (err) {
    return { error: 'Invalid token', status: 401, err };
  }
}

// ✅ GET: Public (used in dropdowns and dashboards)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '6'); // default: 6 projects per page
    const skip = (page - 1) * limit;

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        select: {
          id: true,
          title: true,
          location: true,
          startDate: true,
          expectedEndDate: true,
          budget: true,
          image: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.project.count()
    ]);

    return NextResponse.json({
      projects,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('[API /projects] GET failed:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}


// ✅ POST: Admin only using cookie-based token
export async function POST(req: NextRequest) {
  const auth = await authenticateAdminFromCookies();
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const { title, location, startDate, expectedEndDate, budget, image } = body;

    const newProject = await prisma.project.create({
      data: {
        title,
        location,
        startDate: new Date(startDate),
        expectedEndDate: new Date(expectedEndDate),
        budget,
        image,
        userId: auth.payload.userId as number,
      },
    });

    return NextResponse.json(newProject);
  } catch (err) {
    console.error('[API /projects] POST error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
