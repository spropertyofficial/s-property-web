import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import Admin from '@/lib/models/Admin';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export async function POST(req) {
  await connectDB();

  const token = req.cookies.get('token')?.value;
  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const requester = await Admin.findById(decoded.id);

    if (requester.role !== 'superadmin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { userId, newPassword } = await req.json();
    const user = await Admin.findById(userId);
    if (!user) return NextResponse.json({ message: 'User tidak ditemukan' }, { status: 404 });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    return NextResponse.json({ message: 'Password berhasil direset' });
  } catch (err) {
    return NextResponse.json({ message: 'Terjadi kesalahan' }, { status: 500 });
  }
}
