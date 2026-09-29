import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { AlumniProfile } from '../models/AlumniProfile';
import { Event } from '../models/Event';
import { Rsvp } from '../models/Rsvp';
import { NewsPost } from '../models/NewsPost';
import { JobPost } from '../models/JobPost';
import { Donation } from '../models/Donation';
import { BankTransferRequest } from '../models/BankTransferRequest';
import { Discussion } from '../models/Discussion';
import { BloodRequest } from '../models/BloodRequest';
import { Notification } from '../models/Notification';
import {
  AlumniGroup,
  BloodGroup,
  DonationStatus,
  ContactPreference,
  BloodRequestUrgency,
  BloodRequestStatus,
} from '../lib/types';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/alumni_db';

async function seed() {
  console.log('Connecting to database for seeding School Alumni & Blood Network...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected!');

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    AlumniProfile.deleteMany({}),
    Event.deleteMany({}),
    Rsvp.deleteMany({}),
    NewsPost.deleteMany({}),
    JobPost.deleteMany({}),
    Donation.deleteMany({}),
    BankTransferRequest.deleteMany({}),
    Discussion.deleteMany({}),
    BloodRequest.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  console.log('Cleared existing database records.');

  const hashedPasswordAdmin = await bcrypt.hash('Admin@123456', 10);
  const hashedPasswordAlumni = await bcrypt.hash('Alumni@123456', 10);

  // 1. Create Admin User
  const admin = await User.create({
    name: 'Dr. Rafiqul Islam',
    email: 'admin@alumni.ac.bd',
    password: hashedPasswordAdmin,
    role: 'admin',
    isVerified: true,
    phone: '+8801711000001',
    bloodGroup: BloodGroup.O_POSITIVE,
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  });

  await AlumniProfile.create({
    userId: admin._id,
    batchYear: 1998,
    group: AlumniGroup.SCIENCE,
    department: 'Science',
    bloodGroup: BloodGroup.O_POSITIVE,
    isBloodDonor: true,
    donationStatus: DonationStatus.AVAILABLE,
    bloodDonationConsent: true,
    allowAlumniContact: true,
    donorLocation: 'Dhaka',
    contactPreference: ContactPreference.BOTH,
    lastDonationDate: new Date('2026-06-15'),
    nextEligibleDate: new Date('2026-09-15'),
    donorNotes: 'Regular donor, available for emergency calls in Dhaka central area.',
    company: 'School Alumni Secretariat',
    jobTitle: 'Executive President & Senior Scholar',
    location: 'Dhaka, Bangladesh',
    bio: 'Proud alumnus of Batch 1998 (Science). Committed to empowering our alumni community and supporting emergency blood relief.',
    linkedin: 'https://linkedin.com',
    skills: ['Institutional Governance', 'Mentorship', 'Community Building'],
    phone: '+8801711000001',
    visibility: 'public',
  });

  // 2. Create Diverse School Alumni Profiles across Science, Commerce, Humanities
  const sampleAlumniData = [
    {
      name: 'Tanvir Hossain Sakib',
      email: 'sakib@alumni.ac.bd',
      batchYear: 2015,
      group: AlumniGroup.SCIENCE,
      department: 'Science',
      bloodGroup: BloodGroup.A_POSITIVE,
      isBloodDonor: true,
      donationStatus: DonationStatus.AVAILABLE,
      bloodDonationConsent: true,
      allowAlumniContact: true,
      donorLocation: 'Dhaka',
      contactPreference: ContactPreference.PHONE,
      lastDonationDate: new Date('2026-05-10'),
      nextEligibleDate: new Date('2026-08-10'),
      donorNotes: 'Can donate platelets and whole blood. Weekends preferred.',
      company: 'Google Singapore',
      jobTitle: 'Senior Staff Software Engineer',
      location: 'Dhaka / Singapore',
      bio: 'Science Group Batch 2015. Working on large-scale distributed systems and cloud infrastructure.',
      linkedin: 'https://linkedin.com',
      skills: ['Distributed Systems', 'Go', 'Kubernetes', 'Cloud Architecture'],
      phone: '+8801712345678',
      isVerified: true,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Nusrat Jahan Chowdhury',
      email: 'nusrat@alumni.ac.bd',
      batchYear: 2018,
      group: AlumniGroup.COMMERCE,
      department: 'Commerce',
      bloodGroup: BloodGroup.O_POSITIVE,
      isBloodDonor: true,
      donationStatus: DonationStatus.AVAILABLE,
      bloodDonationConsent: true,
      allowAlumniContact: true,
      donorLocation: 'Dhaka',
      contactPreference: ContactPreference.BOTH,
      lastDonationDate: new Date('2026-04-20'),
      nextEligibleDate: new Date('2026-07-20'),
      donorNotes: 'Universal donor O+. Reach out anytime for hospital emergencies.',
      company: 'bKash Limited',
      jobTitle: 'Lead Product Manager',
      location: 'Dhaka, Bangladesh',
      bio: 'Commerce Group Batch 2018. Driving financial inclusion through fintech.',
      linkedin: 'https://linkedin.com',
      skills: ['Product Strategy', 'Fintech', 'Agile Leadership', 'Analytics'],
      phone: '+8801812345679',
      isVerified: true,
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Arifur Rahman Khan',
      email: 'arif@alumni.ac.bd',
      batchYear: 2010,
      group: AlumniGroup.SCIENCE,
      department: 'Science',
      bloodGroup: BloodGroup.B_POSITIVE,
      isBloodDonor: true,
      donationStatus: DonationStatus.AVAILABLE,
      bloodDonationConsent: true,
      allowAlumniContact: true,
      donorLocation: 'Chattogram',
      contactPreference: ContactPreference.BOTH,
      lastDonationDate: new Date('2026-06-01'),
      nextEligibleDate: new Date('2026-09-01'),
      donorNotes: 'Available across Chattogram medical area.',
      company: 'Tesla Inc.',
      jobTitle: 'Principal Hardware Design Engineer',
      location: 'Chattogram, Bangladesh',
      bio: 'Science Group Batch 2010. Specializing in EV powertrain architecture and hardware safety.',
      linkedin: 'https://linkedin.com',
      skills: ['Hardware Architecture', 'PCB Design', 'Power Electronics'],
      phone: '+8801819998877',
      isVerified: true,
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Farhana Ahmed Trisha',
      email: 'farhana@alumni.ac.bd',
      batchYear: 2020,
      group: AlumniGroup.HUMANITIES,
      department: 'Humanities',
      bloodGroup: BloodGroup.AB_POSITIVE,
      isBloodDonor: true,
      donationStatus: DonationStatus.AVAILABLE,
      bloodDonationConsent: true,
      allowAlumniContact: true,
      donorLocation: 'Dhaka',
      contactPreference: ContactPreference.EMAIL,
      lastDonationDate: new Date('2026-03-12'),
      nextEligibleDate: new Date('2026-06-12'),
      donorNotes: 'AB+ volunteer donor for pediatric and urgent requests.',
      company: 'Studio Morphogenesis',
      jobTitle: 'Senior Urban Architect',
      location: 'Dhaka, Bangladesh',
      bio: 'Humanities Group Batch 2020. Passionate about sustainable urban spaces and historical architecture.',
      linkedin: 'https://linkedin.com',
      skills: ['Sustainable Design', 'Heritage Preservation', 'Urban Planning'],
      phone: '+8801912345680',
      isVerified: true,
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Zubair Al Mahmud',
      email: 'zubair@alumni.ac.bd',
      batchYear: 2023,
      group: AlumniGroup.SCIENCE,
      department: 'Science',
      bloodGroup: BloodGroup.O_NEGATIVE,
      isBloodDonor: true,
      donationStatus: DonationStatus.AVAILABLE,
      bloodDonationConsent: true,
      allowAlumniContact: true,
      donorLocation: 'Dhaka',
      contactPreference: ContactPreference.PHONE,
      lastDonationDate: new Date('2026-07-01'),
      nextEligibleDate: new Date('2026-10-01'),
      donorNotes: 'Rare O- Negative universal donor. Fast responder for ICU emergencies.',
      company: 'Optimizely',
      jobTitle: 'Software Engineer',
      location: 'Dhaka, Bangladesh',
      bio: 'Science Group Batch 2023. Frontend specialist building modern Next.js and TypeScript web platforms.',
      linkedin: 'https://linkedin.com',
      skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
      phone: '+8801612345681',
      isVerified: true,
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Dr. Sabrina Mostafa',
      email: 'sabrina@alumni.ac.bd',
      batchYear: 2016,
      group: AlumniGroup.HUMANITIES,
      department: 'Humanities',
      bloodGroup: BloodGroup.A_NEGATIVE,
      isBloodDonor: true,
      donationStatus: DonationStatus.AVAILABLE,
      bloodDonationConsent: true,
      allowAlumniContact: true,
      donorLocation: 'Sylhet',
      contactPreference: ContactPreference.BOTH,
      lastDonationDate: new Date('2026-05-18'),
      nextEligibleDate: new Date('2026-08-18'),
      donorNotes: 'A- Negative donor in Sylhet region.',
      company: 'The World Bank',
      jobTitle: 'Senior Development Economist',
      location: 'Sylhet / Dhaka',
      bio: 'Humanities Group Batch 2016. Researching social safety nets and public policy development.',
      linkedin: 'https://linkedin.com',
      skills: ['Policy Analysis', 'Public Finance', 'Economic Research'],
      phone: '+8801722334455',
      isVerified: true,
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Mahmudul Hasan Shuvo',
      email: 'shuvo@alumni.ac.bd',
      batchYear: 2012,
      group: AlumniGroup.COMMERCE,
      department: 'Commerce',
      bloodGroup: BloodGroup.B_NEGATIVE,
      isBloodDonor: true,
      donationStatus: DonationStatus.AVAILABLE,
      bloodDonationConsent: true,
      allowAlumniContact: true,
      donorLocation: 'Dhaka',
      contactPreference: ContactPreference.PHONE,
      lastDonationDate: new Date('2026-04-10'),
      nextEligibleDate: new Date('2026-07-10'),
      donorNotes: 'B- Negative rare donor. Available in Mirpur/Dhanmondi zones.',
      company: 'Eastern Bank PLC',
      jobTitle: 'Assistant Vice President',
      location: 'Dhaka, Bangladesh',
      bio: 'Commerce Group Batch 2012. Corporate banking and institutional portfolio manager.',
      linkedin: 'https://linkedin.com',
      skills: ['Corporate Banking', 'Risk Assessment', 'Credit Operations'],
      phone: '+8801712999888',
      isVerified: true,
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Tahmina Akhter Rumi',
      email: 'rumi@alumni.ac.bd',
      batchYear: 2019,
      group: AlumniGroup.HUMANITIES,
      department: 'Humanities',
      bloodGroup: BloodGroup.AB_NEGATIVE,
      isBloodDonor: true,
      donationStatus: DonationStatus.TEMPORARILY_UNAVAILABLE,
      bloodDonationConsent: true,
      allowAlumniContact: false,
      donorLocation: 'Rajshahi',
      contactPreference: ContactPreference.EMAIL,
      lastDonationDate: new Date('2026-09-01'),
      nextEligibleDate: new Date('2026-12-01'),
      donorNotes: 'Currently in recovery period after recent donation.',
      company: 'Bangladesh Civil Service (Administration)',
      jobTitle: 'Assistant Commissioner',
      location: 'Rajshahi, Bangladesh',
      bio: 'Humanities Group Batch 2019. Serving the nation in public administration and grassroots governance.',
      linkedin: 'https://linkedin.com',
      skills: ['Public Administration', 'Civil Service', 'Disaster Relief'],
      phone: '+8801788990011',
      isVerified: true,
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    },
  ];

  const createdUsers = [];
  for (const item of sampleAlumniData) {
    const user = await User.create({
      name: item.name,
      email: item.email,
      password: hashedPasswordAlumni,
      role: 'alumni',
      isVerified: item.isVerified,
      phone: item.phone,
      bloodGroup: item.bloodGroup,
      image: item.image,
    });

    await AlumniProfile.create({
      userId: user._id,
      batchYear: item.batchYear,
      group: item.group,
      department: item.department,
      bloodGroup: item.bloodGroup,
      isBloodDonor: item.isBloodDonor,
      donationStatus: item.donationStatus,
      bloodDonationConsent: item.bloodDonationConsent,
      allowAlumniContact: item.allowAlumniContact,
      donorLocation: item.donorLocation,
      contactPreference: item.contactPreference,
      lastDonationDate: item.lastDonationDate,
      nextEligibleDate: item.nextEligibleDate,
      donorNotes: item.donorNotes,
      company: item.company,
      jobTitle: item.jobTitle,
      location: item.location,
      bio: item.bio,
      linkedin: item.linkedin,
      skills: item.skills,
      phone: item.phone,
      visibility: 'public',
    });

    createdUsers.push(user);
  }

  console.log(`Seeded ${createdUsers.length + 1} school alumni with Group & Blood details.`);

  // 3. Create Realistic Blood Requests (Open, Emergency, Urgent)
  const bloodRequests = await BloodRequest.create([
    {
      requesterId: createdUsers[0]._id,
      patientName: 'Mrs. Begum (Mother of Alumnus)',
      bloodGroup: BloodGroup.O_POSITIVE,
      requiredUnits: 2,
      hospitalName: 'Evercare Hospital Dhaka',
      hospitalLocation: 'Bashundhara R/A, Dhaka',
      requiredDate: new Date('2026-10-02'),
      urgency: BloodRequestUrgency.EMERGENCY,
      contactName: 'Tanvir Hossain Sakib',
      contactPhone: '+8801712345678',
      additionalInformation: 'Urgent open heart bypass surgery scheduled for tomorrow morning. Need fresh O+ blood.',
      status: BloodRequestStatus.OPEN,
    },
    {
      requesterId: createdUsers[2]._id,
      patientName: 'Kamal Uddin (Brother)',
      bloodGroup: BloodGroup.B_POSITIVE,
      requiredUnits: 1,
      hospitalName: 'Chattogram Medical College Hospital (CMCH)',
      hospitalLocation: 'Chattogram',
      requiredDate: new Date('2026-10-05'),
      urgency: BloodRequestUrgency.URGENT,
      contactName: 'Arifur Rahman Khan',
      contactPhone: '+8801819998877',
      additionalInformation: 'Platelet transfusion for dengue patient in ICU Ward 4.',
      status: BloodRequestStatus.OPEN,
    },
    {
      requesterId: createdUsers[4]._id,
      patientName: 'Master Ayan (Child)',
      bloodGroup: BloodGroup.O_NEGATIVE,
      requiredUnits: 2,
      hospitalName: 'Dhaka Shishu (Children) Hospital',
      hospitalLocation: 'Sher-e-Bangla Nagar, Dhaka',
      requiredDate: new Date('2026-10-08'),
      urgency: BloodRequestUrgency.EMERGENCY,
      contactName: 'Zubair Al Mahmud',
      contactPhone: '+8801612345681',
      additionalInformation: 'Thalassemia regular transfusion. Rare O- blood needed urgently.',
      status: BloodRequestStatus.OPEN,
    },
    {
      requesterId: createdUsers[1]._id,
      patientName: 'Fatema Tuz Zohra',
      bloodGroup: BloodGroup.A_POSITIVE,
      requiredUnits: 1,
      hospitalName: 'Square Hospital Limited',
      hospitalLocation: 'Panthapath, Dhaka',
      requiredDate: new Date('2026-09-20'),
      urgency: BloodRequestUrgency.NORMAL,
      contactName: 'Nusrat Jahan Chowdhury',
      contactPhone: '+8801812345679',
      additionalInformation: 'Elective surgery successfully completed. Units fulfilled by alumni donors.',
      status: BloodRequestStatus.FULFILLED,
    },
  ]);

  console.log(`Seeded ${bloodRequests.length} blood requests.`);

  // 4. Create In-App Notifications
  await Notification.create([
    {
      userId: createdUsers[1]._id,
      title: 'Emergency Blood Request (O+)',
      message: 'An emergency blood request for O+ was posted near your location (Evercare Hospital Dhaka).',
      type: 'blood_request',
      link: `/blood-requests/${bloodRequests[0]._id}`,
      read: false,
    },
    {
      userId: createdUsers[4]._id,
      title: 'Rare Blood Match Alert (O-)',
      message: 'A child patient urgently requires 2 units of O- at Dhaka Shishu Hospital. Please check if you can help.',
      type: 'blood_request',
      link: `/blood-requests/${bloodRequests[2]._id}`,
      read: false,
    },
  ]);

  // 5. Create Events
  const event1 = await Event.create({
    title_bn: 'গ্র্যান্ড স্কুল অ্যালামনাই রিইউনিয়ন ২০২৬ — সিলভার জুবিলি মিলনমেলা',
    title_en: 'Grand School Alumni Reunion 2026 — Silver Jubilee Gathering',
    description_bn:
      'আমাদের প্রিয় বিদ্যালয়ের ২৫ বছর পূর্তি উপলক্ষে অনুষ্ঠিত হতে যাচ্ছে সর্বকালের সর্ববৃহৎ গ্র্যান্ড রিইউনিয়ন। এতে থাকছে বর্ণাঢ্য র্যালি, স্মৃতিচারণ, সম্মাননা প্রদান, সাংস্কৃতিক সন্ধ্যা ও জমকালো নৈশভোজ।',
    description_en:
      'Celebrating 25 years of glorious legacy with our flagship Mega Reunion. Featuring a colorful parade, memory sharing, distinguished alumni awards, cultural concert, and grand buffet dinner.',
    date: new Date('2026-12-18T09:00:00Z'),
    location: 'School Main Auditorium & Campus Field, Dhaka',
    category: 'Reunion',
    capacity: 2500,
    createdBy: admin._id,
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    attendees: [admin._id, createdUsers[0]._id, createdUsers[1]._id, createdUsers[2]._id],
  });

  const event2 = await Event.create({
    title_bn: 'বিজ্ঞান, বাণিজ্য ও মানবিক গ্র্যাজুয়েটদের ক্যারিয়ার কনক্লেভ',
    title_en: 'Science, Commerce & Humanities Career Conclave 2026',
    description_bn:
      'তিনটি প্রধান একাডেমিক স্ট্রিমের শীর্ষস্থানীয় বিশেষজ্ঞদের সাথে বিশেষ দিকনির্দেশনামূলক সেশন। উচ্চশিক্ষা, সিভিল সার্ভিস ও করপোরেট ক্যারিয়ার প্রস্তুতি।',
    description_en:
      'Interactive panel sessions with distinguished alumni leaders from Tech, Banking, Civil Service, and Law for graduating students.',
    date: new Date('2026-10-25T14:00:00Z'),
    location: 'Online (Zoom & YouTube Live Stream)',
    category: 'Webinar',
    capacity: 1000,
    createdBy: admin._id,
    image: 'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?auto=format&fit=crop&w=1200&q=80',
    attendees: [createdUsers[0]._id, createdUsers[2]._id, createdUsers[4]._id],
  });

  // Create RSVP records
  await Rsvp.create({
    userId: createdUsers[0]._id,
    eventId: event1._id,
    status: 'going',
    guestsCount: 1,
  });
  await Rsvp.create({
    userId: createdUsers[1]._id,
    eventId: event1._id,
    status: 'going',
    guestsCount: 2,
  });

  console.log('Seeded events and RSVPs.');

  // 6. Create News & Stories
  await NewsPost.create([
    {
      title_bn: 'স্কুল অ্যালামনাই অ্যাসোসিয়েশনের উদ্যোগে জরুরি ব্লাড ডোনার হাব চালু',
      title_en: 'School Alumni Association Launches Live Blood Donation & Emergency Network',
      slug: 'alumni-launches-live-blood-donor-network',
      summary_bn: 'প্রাক্তন শিক্ষক, শিক্ষার্থী ও পরিবারের সদস্যদের জরুরি চিকিৎসায় রক্তদানে যুক্ত হলো এই সমন্বিত ডিজিটাল প্ল্যাটফর্ম।',
      summary_en: 'A state-of-the-art emergency blood matching portal connecting volunteer alumni donors across all districts.',
      content_bn:
        'বিদ্যালয়ের শত সহস্র প্রাক্তন শিক্ষার্থী ও তাদের পরিবারের যেকোনো জরুরি চিকিৎসা প্রয়োজনে রক্তদান সহজ ও নির্ভরযোগ্য করতে চালু হলো লাইভ ব্লাড ব্যাংক নেটওয়ার্ক। এই প্ল্যাটফর্মের মাধ্যমে যেকোনো প্রাক্তন সদস্য রক্তের আবেদন জানাতে পারবেন এবং রক্তের গ্রুপ ও জেলা অনুযায়ী উপযুক্ত রক্তদাতার সাথে তাৎক্ষণিকভাবে যোগাযোগ করতে পারবেন।',
      content_en:
        'To ensure no school community member or their family suffers from a shortage of blood during emergencies, the Alumni Association has officially deployed a modern Blood Donation & Matching portal.',
      category: 'Announcement',
      image: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=1200&q=80',
      authorId: admin._id,
      views: 1980,
      publishedAt: new Date('2026-09-15'),
    },
    {
      title_bn: 'মেধাবী শিক্ষার্থীদের জন্য ১০ লাখ টাকার শিক্ষাবৃত্তি তহবিল উদ্বোধন',
      title_en: 'Alumni Launches 1 Million BDT Student Scholarship Endowment',
      slug: 'school-alumni-scholarship-endowment',
      summary_bn: 'অসচ্ছল ও প্রতিভাবান শিক্ষার্থীদের পড়াশোনা নির্বিঘ্ন রাখতে চালু হলো বিশেষ বৃত্তি তহবিল।',
      summary_en: 'Dedicated to sponsoring tuition and educational supplies for underprivileged students.',
      content_bn:
        'অর্থের অভাবে যেন কোনো মেধাবী শিক্ষার্থীর স্বপ্ন থমকে না যায়, সেই লক্ষ্যে প্রাক্তন শিক্ষার্থীদের সম্মিলিত অনুদানে চালু হয়েছে এই শিক্ষাবৃত্তি তহবিল।',
      content_en:
        'The Alumni Association proudly established a 1 Million BDT Scholarship Fund to support gifted students with complete schooling stipends.',
      category: 'Achievement',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
      authorId: admin._id,
      views: 1420,
      publishedAt: new Date('2026-09-01'),
    },
  ]);

  // 7. Create Job Openings
  await JobPost.create([
    {
      title: 'Senior Software Engineer (Full Stack)',
      company: 'Brain Station 23 PLC',
      location: 'Dhaka (Hybrid)',
      type: 'full_time',
      salaryRange: '৳1,50,000 – ৳2,20,000 / month',
      description: 'Architecting high-performance enterprise platforms using Next.js and Node.js.',
      requirements: ['4+ years experience', 'Next.js & TypeScript', 'MongoDB / PostgreSQL'],
      contactEmail: 'careers@brainstation-23.com',
      isReferral: true,
      postedBy: createdUsers[0]._id,
      deadline: new Date('2026-11-30'),
      isActive: true,
    },
    {
      title: 'Assistant Brand & Product Manager',
      company: 'bKash Limited',
      location: 'Dhaka',
      type: 'full_time',
      salaryRange: '৳80,000 – ৳1,20,000 / month',
      description: 'Leading marketing campaigns for digital merchant payments and user acquisition.',
      requirements: ['Commerce/Business background', '2+ years marketing experience'],
      contactEmail: 'product-hiring@bkash.com',
      isReferral: true,
      postedBy: createdUsers[1]._id,
      deadline: new Date('2026-10-31'),
      isActive: true,
    },
  ]);

  // 8. Create Donations
  await Donation.create([
    {
      donorName: 'Tanvir Hossain Sakib',
      donorEmail: 'sakib@alumni.ac.bd',
      donorPhone: '01712345678',
      amount: 100000,
      currency: 'BDT',
      campaign: 'Student Scholarship Endowment Fund',
      isAnonymous: false,
      method: 'card',
      transactionId: 'TXN-2026-DON-001',
      valId: 'VAL-2026-001',
      receiptNumber: 'ALM-REC-2026-100452',
      status: 'completed',
      userId: createdUsers[0]._id,
      paidAt: new Date('2026-08-15'),
    },
    {
      donorName: 'Anonymous Alumnus (USA Chapter)',
      donorEmail: 'donor.usa@alumni.ac.bd',
      donorPhone: '01700000000',
      amount: 250000,
      currency: 'BDT',
      campaign: 'Student Scholarship Endowment Fund',
      isAnonymous: true,
      method: 'bank',
      transactionId: 'TXN-2026-DON-002',
      valId: 'VAL-2026-002',
      receiptNumber: 'ALM-REC-2026-100453',
      status: 'completed',
      paidAt: new Date('2026-08-20'),
    },
  ]);

  // 9. Create Community Discussion
  await Discussion.create([
    {
      category: 'General',
      group: AlumniGroup.SCIENCE,
      authorId: createdUsers[0]._id,
      title: 'School Alumni Science Club & Robotics Mentorship Program 2026',
      content:
        'We are launching a weekend robotics and STEM workshop series for current school students. Science group alumni interested in conducting guest sessions, please comment below!',
      comments: [
        {
          authorId: createdUsers[4]._id,
          content: 'I would love to take an introduction to web development and coding workshop!',
          createdAt: new Date('2026-09-18T10:00:00Z'),
        },
      ],
      likes: [createdUsers[1]._id, createdUsers[2]._id, createdUsers[4]._id],
    },
  ]);

  console.log('✅ Database seeding successfully completed with full School Alumni + Blood Donation dataset!');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});
