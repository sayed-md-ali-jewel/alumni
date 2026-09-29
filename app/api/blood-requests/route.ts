import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { BloodRequest } from '@/models/BloodRequest';
import { User } from '@/models/User';
import { AlumniProfile } from '@/models/AlumniProfile';
import { Notification } from '@/models/Notification';
import { BloodRequestCreateSchema } from '@/lib/validations';
import { BLOOD_GROUPS, BLOOD_REQUEST_URGENCIES, BLOOD_REQUEST_STATUSES } from '@/lib/types';
import { getCompatibleDonors } from '@/lib/blood-compatibility';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const bloodGroup = searchParams.get('bloodGroup');
    const urgency = searchParams.get('urgency');
    const status = searchParams.get('status');
    const location = searchParams.get('location');
    const q = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const skip = (page - 1) * limit;

    await connectToDatabase();

    const query: any = {};

    // By default show open, accepted, and partially fulfilled requests unless status is specified
    if (status && status !== 'all') {
      query.status = status;
    } else {
      query.status = { $in: ['Open', 'Accepted', 'Partially Fulfilled'] };
    }

    if (bloodGroup && bloodGroup !== 'all') {
      query.bloodGroup = bloodGroup;
    }

    if (urgency && urgency !== 'all') {
      query.urgency = urgency;
    }

    if (location && location !== 'all') {
      query.$or = [
        { hospitalLocation: { $regex: location, $options: 'i' } },
        { hospitalName: { $regex: location, $options: 'i' } },
        { hospitalAddress: { $regex: location, $options: 'i' } },
      ];
    }

    if (q) {
      query.$or = [
        { patientName: { $regex: q, $options: 'i' } },
        { hospitalName: { $regex: q, $options: 'i' } },
        { hospitalAddress: { $regex: q, $options: 'i' } },
        { hospitalLocation: { $regex: q, $options: 'i' } },
        { contactName: { $regex: q, $options: 'i' } },
      ];
    }

    const total = await BloodRequest.countDocuments(query);
    const requests = await BloodRequest.find(query)
      .populate('requesterId', 'name email image isVerified phone')
      .populate('acceptedByUserId', 'name email image phone bloodGroup isVerified')
      .sort({
        urgency: 1, // Emergency / Urgent first
        requiredDate: 1, // Soonest required date first
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit);

    // Counts for overview badges
    const [emergencyCount, urgentCount, totalActive] = await Promise.all([
      BloodRequest.countDocuments({ status: 'Open', urgency: 'Emergency' }),
      BloodRequest.countDocuments({ status: 'Open', urgency: 'Urgent' }),
      BloodRequest.countDocuments({ status: { $in: ['Open', 'Accepted', 'Partially Fulfilled'] } }),
    ]);

    return NextResponse.json({
      requests,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        totalActive,
        emergencyCount,
        urgentCount,
      },
      filters: {
        bloodGroups: Array.from(BLOOD_GROUPS),
        urgencies: Array.from(BLOOD_REQUEST_URGENCIES),
        statuses: Array.from(BLOOD_REQUEST_STATUSES),
      },
    });
  } catch (error: any) {
    console.error('Error fetching blood requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blood requests' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Please sign in to post a blood request' }, { status: 401 });
    }

    const requesterId = (session.user as any).id;
    const body = await req.json();
    const validatedData = BloodRequestCreateSchema.parse(body);

    await connectToDatabase();

    const newRequest = await BloodRequest.create({
      requesterId,
      patientName: validatedData.patientName,
      bloodGroup: validatedData.bloodGroup,
      requiredUnits: validatedData.requiredUnits,
      hospitalName: validatedData.hospitalName,
      hospitalAddress: validatedData.hospitalAddress || '',
      hospitalLocation: validatedData.hospitalLocation,
      requiredDate: new Date(validatedData.requiredDate),
      urgency: validatedData.urgency,
      contactName: validatedData.contactName,
      contactPhone: validatedData.contactPhone,
      additionalInformation: validatedData.additionalInformation || '',
      status: 'Open',
    });

    // Notify all matching & compatible eligible alumni donors
    try {
      const compatibleGroups = getCompatibleDonors(validatedData.bloodGroup);
      const matchingDonors = await AlumniProfile.find({
        bloodGroup: { $in: compatibleGroups },
        $or: [
          { isBloodDonor: true },
          { bloodDonationConsent: true },
          { donationStatus: 'Available' },
        ],
      }).select('userId bloodGroup');

      if (matchingDonors.length > 0) {
        const formattedDate = new Date(validatedData.requiredDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });

        const notificationsToInsert = matchingDonors
          .filter((d) => d.userId && d.userId.toString() !== requesterId)
          .map((d) => ({
            userId: d.userId,
            type: 'blood_request',
            title: `🚨 ${validatedData.urgency === 'Emergency' ? 'Emergency' : 'Urgent'} ${validatedData.bloodGroup} Blood Request: ${validatedData.patientName}`,
            message: `${validatedData.urgency === 'Emergency' ? '🚨 EMERGENCY: ' : ''}${validatedData.patientName} urgently needs ${validatedData.requiredUnits} unit(s) of ${validatedData.bloodGroup} blood at ${validatedData.hospitalName}, ${validatedData.hospitalLocation} (by ${formattedDate}). Tap to accept or share.`,
            link: `/blood-requests/${newRequest._id}`,
            read: false,
          }));

        if (notificationsToInsert.length > 0) {
          await Notification.insertMany(notificationsToInsert);
        }
      }
    } catch (notifErr) {
      console.error('Non-blocking notification dispatch error:', notifErr);
    }

    return NextResponse.json(
      {
        message: 'Blood request submitted successfully!',
        request: newRequest,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating blood request:', error);
    if (error?.name === 'ZodError' || error?.errors) {
      const messages = (error.errors || []).map((e: any) => e.message).filter(Boolean);
      return NextResponse.json(
        { error: messages.join('. ') || 'Validation error', errors: messages },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error?.message || 'Failed to create blood request' },
      { status: 500 }
    );
  }
}
