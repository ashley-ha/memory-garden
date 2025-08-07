export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-parchment">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-elvish-title text-3xl mb-8 text-center">Terms of Service</h1>
        
        <div className="card-elvish p-8 space-y-6 text-elvish-body">
          <section>
            <h2 className="text-elvish-title text-xl mb-3">1. Acceptance of Terms</h2>
            <p>By accessing and using Memory Garden, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.</p>
          </section>

          <section>
            <h2 className="text-elvish-title text-xl mb-3">2. Description of Service</h2>
            <p>Memory Garden is a collaborative learning platform where users can create and study flashcards using spaced repetition. The service is provided "as is" without warranties of any kind.</p>
          </section>

          <section>
            <h2 className="text-elvish-title text-xl mb-3">3. User Content</h2>
            <p>You retain ownership of content you create. By posting content, you grant us a non-exclusive license to use, display, and distribute your content within the service. You are responsible for ensuring your content does not violate any laws or third-party rights.</p>
          </section>

          <section>
            <h2 className="text-elvish-title text-xl mb-3">4. Acceptable Use</h2>
            <p>You agree not to post content that is:</p>
            <ul className="list-disc list-inside ml-4 mt-2">
              <li>Illegal, harmful, or offensive</li>
              <li>Infringing on intellectual property rights</li>
              <li>Spam or misleading</li>
              <li>Violating others' privacy</li>
            </ul>
          </section>

          <section>
            <h2 className="text-elvish-title text-xl mb-3">5. Privacy</h2>
            <p>Your use of our service is also governed by our Privacy Policy. We respect your privacy and handle your data in accordance with applicable laws.</p>
          </section>

          <section>
            <h2 className="text-elvish-title text-xl mb-3">6. Termination</h2>
            <p>We reserve the right to terminate or suspend access to our service for violations of these terms or for any other reason at our discretion.</p>
          </section>

          <section>
            <h2 className="text-elvish-title text-xl mb-3">7. Limitation of Liability</h2>
            <p>Memory Garden and its operators shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service.</p>
          </section>

          <section>
            <h2 className="text-elvish-title text-xl mb-3">8. Changes to Terms</h2>
            <p>We may update these terms from time to time. Continued use of the service after changes constitutes acceptance of the new terms.</p>
          </section>

          <section>
            <h2 className="text-elvish-title text-xl mb-3">9. Contact</h2>
            <p>For questions about these terms, please contact us through the Memory Garden platform.</p>
          </section>

          <div className="text-center mt-8 text-sm text-forest/60">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="text-center mt-8">
          <a href="/" className="btn-elvish">
            Return to Garden
          </a>
        </div>
      </div>
    </div>
  )
}