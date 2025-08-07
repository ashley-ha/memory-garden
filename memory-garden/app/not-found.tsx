import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-parchment flex items-center justify-center p-4">
      <div className="card-elvish max-w-md w-full text-center">
        <h1 className="text-elvish-title text-3xl mb-4">
          🍃 Lost in the Garden
        </h1>
        <p className="text-elvish-body mb-6">
          The path you seek does not exist in our Memory Garden. 
          Perhaps the scroll has been moved or the way has changed.
        </p>
        <Link href="/" className="btn-elvish">
          Return to the Garden
        </Link>
      </div>
    </div>
  )
}