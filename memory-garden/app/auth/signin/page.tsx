'use client'

import { signIn, getProviders } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function SignIn() {
  const [providers, setProviders] = useState<any>(null)

  useEffect(() => {
    const fetchProviders = async () => {
      const res = await getProviders()
      setProviders(res)
    }
    fetchProviders()
  }, [])

  if (!providers) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gold/20 rounded w-64 mx-auto mb-4"></div>
          <div className="h-4 bg-gold/10 rounded w-48 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-parchment">
      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <div className="mb-6">
          <Link href="/" className="text-gold hover:text-gold/80 font-inter text-sm">
            ← Back to Memory Garden
          </Link>
        </div>

        <div className="max-w-md mx-auto">
          <div className="card-elvish text-center">
            <h1 className="text-elvish-title text-2xl mb-6">
              Welcome to Memory Garden
            </h1>
            <p className="text-elvish-body mb-8">
              Knowledge is power. Learn with others. Share your wisdom with the world. 
            </p>

            <div className="space-y-4">
              {Object.values(providers).map((provider: any) => (
                <div key={provider.name}>
                  <button
                    onClick={() => signIn(provider.id, { callbackUrl: '/' })}
                    className="btn-elvish w-full flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span>Continue with {provider.name}</span>
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-gold/20">
              <p className="text-elvish-body text-sm text-forest/60">
                By signing in, you agree to our community guidelines and can start contributing wisdom to help others learn.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}