export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-parchment">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-elvish-title text-3xl mb-8 text-center">Privacy Policy</h1>
        
        <div className="card-elvish p-8 space-y-6 text-elvish-body">
          <section>
            <h2 className="text-elvish-title text-xl mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly to us:</p>
            <ul className="list-disc list-inside ml-4 mt-2">
              <li>Account information (email, username, profile picture) when you sign in with Google</li>
              <li>Content you create (topics, cards, study progress)</li>
              <li>Usage data (which cards you study, your ratings)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-elvish-title text-xl mb-3">2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc list-inside ml-4 mt-2">
              <li>Provide and improve our services</li>
              <li>Personalize your learning experience</li>
              <li>Track your study progress</li>
              <li>Display attribution for content you create</li>
            </ul>
          </section>

          <section>
            <h2 className="text-elvish-title text-xl mb-3">3. Information Sharing</h2>
            <p>We do not sell or rent your personal information. We may share information:</p>
            <ul className="list-disc list-inside ml-4 mt-2">
              <li>With your consent</li>
              <li>To comply with legal obligations</li>
              <li>To protect rights and safety</li>
            </ul>
          </section>

          <section>
            <h2 className="text-elvish-title text-xl mb-3">4. Data Security</h2>
            <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
          </section>

          <section>
            <h2 className="text-elvish-title text-xl mb-3">5. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc list-inside ml-4 mt-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-elvish-title text-xl mb-3">6. Cookies</h2>
            <p>We use essential cookies to maintain your session and preferences. These are necessary for the service to function properly.</p>
          </section>

          <section>
            <h2 className="text-elvish-title text-xl mb-3">7. Children's Privacy</h2>
            <p>Our service is not directed to children under 13. We do not knowingly collect personal information from children under 13.</p>
          </section>

          <section>
            <h2 className="text-elvish-title text-xl mb-3">8. Changes to This Policy</h2>
            <p>We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.</p>
          </section>

          <section>
            <h2 className="text-elvish-title text-xl mb-3">9. Contact Us</h2>
            <p>If you have questions about this privacy policy, please contact us through the Memory Garden platform.</p>
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