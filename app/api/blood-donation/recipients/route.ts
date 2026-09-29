import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { BloodRequest } from '@/models/BloodRequest';
import { User } from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const [bloodRequests, users] = await Promise.all([
      BloodRequest.find()
        .sort({ createdAt: -1 })
        .limit(30)
        .select('_id patientName hospitalName bloodGroup requesterId contactName contactPhone status')
        .lean(),
      User.find({ role: { $in: ['alumni', 'admin', 'user'] } })
        .sort({ name: 1 })
        .limit(50)
        .select('_id name email bloodGroup phone')
        .lean(),
    ]);

    const recipients = [
      ...bloodRequests.map((br: any) => ({
        id: br._id.toString(),
        type: 'blood_request',
        name: br.patientName,
        label: `${br.patientName} (Patient • ${br.bloodGroup} • ${br.hospitalName})`,
        hospitalName: br.hospitalName,
        bloodGroup: br.bloodGroup,
        requesterId: br.requesterId?.toString(),
        contactPhone: br.contactPhone,
      })),
      ...users.map((u: any) => ({
        id: u._id.toString(),
        type: 'user',
        name: u.name,
        label: `${u.name} (Alumni Member${u.bloodGroup ? ` • ${u.bloodGroup}` : ''})`,
        email: u.email,
        bloodGroup: u.bloodGroup,
      })),
    ];

    return NextResponse.json({ recipients });
  } catch (error: any) {
    console.error('Error fetching recipients:', error);
    return NextResponse.json({ error: 'Failed to fetch recipients' }, { status: 500 });
  }
}
