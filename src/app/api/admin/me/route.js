import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import Admin from '@/lib/models/Admin';
import connectDB from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export async function GET(req) {
  await connectDB();

  const token = req.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select('-password'); // tanpa password

    if (!admin) {
      return NextResponse.json({ message: 'Admin not found' }, { status: 404 });
    }

    return NextResponse.json(admin);
  } catch {
    return NextResponse.json({ message: 'Invalid token' }, { status: 403 });
  }
}
