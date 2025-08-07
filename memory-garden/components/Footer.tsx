import Link from 'next/link'

export function Footer() {
  return (
    <footer className="mt-auto border-t border-gold/20 bg-parchment/50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-elvish-body text-sm text-forest/60">
            <p>🍃 Memory Garden - Learn together, grow together</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-elvish-body text-sm">
            <Link href="/legal/terms" className="text-forest/60 hover:text-gold transition-colors">
              Terms of Service
            </Link>
            <Link href="/legal/privacy" className="text-forest/60 hover:text-gold transition-colors">
              Privacy Policy
            </Link>
            <a 
              href="mailto:ashleyha0317@gmail.com" 
              className="text-forest/60 hover:text-gold transition-colors"
            >
              Feedback
            </a>
          </div>
          
          <div className="text-elvish-body text-sm text-forest/60">
            <p>© {new Date().getFullYear()} Memory Garden</p>
          </div>
        </div>
      </div>
    </footer>
  )
}