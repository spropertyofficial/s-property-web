import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import Admin from '@/lib/models/Admin';

export async function POST(req) {
  await connectDB();
  const { email, password } = await req.json();

  const existing = await Admin.findOne({ email });
  if (existing) {
    return NextResponse.json({ message: 'Admin already exists' }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);
  const admin = await Admin.create({ email, password: hashed });

  return NextResponse.json({ message: 'Registered successfully', adminId: admin._id });
}
