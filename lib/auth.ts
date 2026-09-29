import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import { AlumniProfile } from '@/models/AlumniProfile';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter email and password');
        }

        await connectToDatabase();

        const user = await User.findOne({
          email: credentials.email.toLowerCase().trim(),
        });

        if (!user || !user.password) {
          throw new Error('No user found with this email');
        }

        const isPasswordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordMatch) {
          throw new Error('Incorrect password');
        }

        // Fetch associated profile if exists
        const profile = await AlumniProfile.findOne({ userId: user._id });

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          image: user.image || '',
          batchYear: profile?.batchYear,
          group: profile?.group,
          bloodGroup: profile?.bloodGroup || user.bloodGroup,
          isBloodDonor: profile?.isBloodDonor || false,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'mock-google-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'mock-google-secret',
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.isVerified = (user as any).isVerified;
        token.batchYear = (user as any).batchYear;
        token.group = (user as any).group;
        token.bloodGroup = (user as any).bloodGroup;
        token.isBloodDonor = (user as any).isBloodDonor;
      }

      // Handle session updates (e.g. after profile edit)
      if (trigger === 'update' && session) {
        if (session.name) token.name = session.name;
        if (session.image) token.picture = session.image;
        if (session.isVerified !== undefined) token.isVerified = session.isVerified;
        if (session.group) token.group = session.group;
        if (session.bloodGroup) token.bloodGroup = session.bloodGroup;
        if (session.isBloodDonor !== undefined) token.isBloodDonor = session.isBloodDonor;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).isVerified = token.isVerified;
        (session.user as any).batchYear = token.batchYear;
        (session.user as any).group = token.group;
        (session.user as any).bloodGroup = token.bloodGroup;
        (session.user as any).isBloodDonor = token.isBloodDonor;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'super_secret_alumni_jwt_key_2026_bd_app',
};
