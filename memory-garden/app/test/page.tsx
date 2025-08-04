export default function TestPage() {
  return (
    <div className="min-h-screen bg-parchment">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-elvish-title text-4xl mb-4 text-center">
          Test Page
        </h1>
        <p className="text-elvish-body text-center">
          This is a simple server-rendered page to test if hydration works without client-side logic.
        </p>
        <div className="mt-8 text-center">
          <div className="card-elvish max-w-md mx-auto">
            <h2 className="text-elvish-title text-xl mb-2">Static Content</h2>
            <p className="text-elvish-body">
              If you can see this without hydration errors, the issue is with client-side state management.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}