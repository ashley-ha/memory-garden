// Auth setup commented out for MVP - using simple session-based tracking instead
// import { NextAuthOptions } from 'next-auth'
// import GoogleProvider from 'next-auth/providers/google'

// export const authOptions: NextAuthOptions = {
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//     }),
//   ],
//   callbacks: {
//     session: async ({ session, token }) => {
//       if (session?.user) {
//         (session.user as any).id = token.sub!
//       }
//       return session
//     },
//     jwt: async ({ user, token }) => {
//       if (user) {
//         token.uid = user.id
//       }
//       return token
//     },
//   },
//   session: {
//     strategy: 'jwt',
//   },
//   pages: {
//     signIn: '/auth/signin',
//   },
// }

// For MVP, we're using simple session-based tracking
export const authOptions = {}