import NextAuth from 'next-auth'
import type { NextAuthOptions } from 'next-auth'
import { db } from '@/lib/db'
import { users } from '@/shared/schema'
import { eq } from 'drizzle-orm'

const authOptions: NextAuthOptions = {
  providers: [
    {
      id: 'replit',
      name: 'Replit',
      type: 'oauth',
      issuer: process.env.ISSUER_URL || 'https://replit.com/oidc',
      clientId: process.env.REPL_ID!,
      clientSecret: process.env.REPL_ID!, // Using REPL_ID as secret for Replit OIDC
      authorization: {
        url: `${process.env.ISSUER_URL || 'https://replit.com/oidc'}/auth`,
        params: {
          scope: 'openid email profile offline_access',
          prompt: 'login consent',
        },
      },
      token: `${process.env.ISSUER_URL || 'https://replit.com/oidc'}/token`,
      userinfo: `${process.env.ISSUER_URL || 'https://replit.com/oidc'}/userinfo`,
      profile(profile) {
        return {
          id: profile.sub,
          name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email,
          email: profile.email,
          image: profile.profile_image_url,
        }
      },
    },
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'replit' && profile) {
        try {
          // Upsert user in database
          await db
            .insert(users)
            .values({
              id: profile.sub as string,
              email: profile.email as string,
              firstName: profile.first_name as string,
              lastName: profile.last_name as string,
              profileImageUrl: profile.profile_image_url as string,
            })
            .onConflictDoUpdate({
              target: users.id,
              set: {
                email: profile.email as string,
                firstName: profile.first_name as string,
                lastName: profile.last_name as string,
                profileImageUrl: profile.profile_image_url as string,
                updatedAt: new Date(),
              },
            })
        } catch (error) {
          console.error('Error upserting user:', error)
          return false
        }
      }
      return true
    },
    async session({ session, token }) {
      if (token?.sub) {
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.sub = profile.sub
      }
      return token
    },
  },
  pages: {
    signIn: '/',
    error: '/',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }