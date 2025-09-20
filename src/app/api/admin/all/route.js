import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import Admin from '@/lib/models/Admin';
import connectDB from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export async function GET(req) {
  await connectDB();

  const token = req.cookies.get('auth-token')?.value;
  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const requester = await Admin.findById(decoded.userId);

    if (requester.role !== 'superadmin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const admins = await Admin.find({}, '-password');
    return NextResponse.json({ admins });
  } catch (error) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }
}
