import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Legends Insurance Services" },
      {
        name: "description",
        content:
          "Terms and conditions for using the Legends Insurance Services website and services.",
      },
      { property: "og:title", content: "Terms of Service — Legends Insurance Services" },
      {
        property: "og:description",
        content: "The terms that govern your use of our website and services.",
      },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="font-display text-4xl text-primary md:text-5xl">Terms of Service</h1>
      <p className="mt-3 text-sm text-muted-foreground">Effective Date: 2026</p>

      <div className="prose prose-slate mt-10 max-w-none text-foreground/85">
        <p>
          Welcome to Legends Insurance Services. By accessing our website or engaging
          our services, you agree to the following terms and conditions. Please read
          them carefully.
        </p>

        <h2 className="mt-10 font-display text-2xl text-primary">1. Services Provided</h2>
        <p>
          Legends Insurance Services is an independent insurance agency providing
          information, quotes, and administrative services related to life insurance
          products. We are not an insurance carrier; all policies are subject to the
          terms of the specific insurance company issuing the policy.
        </p>

        <h2 className="mt-10 font-display text-2xl text-primary">2. Eligibility & Age Restriction</h2>
        <p>
          You must be at least 18 years of age to use our services or submit any
          personal information through this website. By using this site, you represent
          and warrant that you meet this age requirement.
        </p>

        <h2 className="mt-10 font-display text-2xl text-primary">3. SMS and Mobile Messaging Terms</h2>
        <p>
          By providing your phone number and opting in through our website (such as on
          our Contact Us page), you consent to receive SMS text messages from Legends
          Insurance Services.
        </p>
        <ul className="ml-6 list-disc space-y-2">
          <li><strong>SMS Use Cases:</strong> Messages will be limited to providing information on Life Insurance options, conducting follow-up communications regarding your inquiries, and sending "Happy Birthday" greetings.</li>
          <li><strong>Frequency:</strong> Message frequency varies based on your interaction with us and your specific insurance needs.</li>
          <li><strong>Opt-Out Instructions:</strong> You can unsubscribe from SMS communications at any time. To opt-out, simply reply STOP to any message you receive from us.</li>
          <li><strong>Help & Support:</strong> Reply HELP for more information or contact our support team at <a className="text-secondary underline" href="mailto:support@legendsinsuranceservices.com">support@legendsinsuranceservices.com</a>.</li>
          <li><strong>Message & Data Rates:</strong> Standard message and data rates may apply from your mobile carrier for any messages sent or received.</li>
          <li><strong>Carrier Liability Disclaimer:</strong> Mobile carriers (such as T-Mobile, Verizon, AT&T, etc.) are not liable for delayed or undelivered messages.</li>
        </ul>

        <h2 className="mt-10 font-display text-2xl text-primary">4. Privacy</h2>
        <p>
          Your privacy is important to us. Our collection and use of your data,
          including mobile information, are governed by our{" "}
          <Link to="/privacy" className="text-secondary underline">Privacy Policy</Link>.
        </p>

        <h2 className="mt-10 font-display text-2xl text-primary">5. Accuracy of Information</h2>
        <p>
          To provide accurate life insurance quotes, you agree to provide truthful and
          complete information. Providing false data may lead to inaccurate quotes,
          denial of coverage by the carrier, or the voiding of a policy.
        </p>

        <h2 className="mt-10 font-display text-2xl text-primary">6. No Guarantee of Coverage</h2>
        <p>
          All quotes provided are estimates based on the information you provide.
          Final premium rates and coverage eligibility are determined solely by the
          insurance underwriting company and are not guaranteed by Legends Insurance
          Services.
        </p>

        <h2 className="mt-10 font-display text-2xl text-primary">7. Limitation of Liability</h2>
        <p>
          Legends Insurance Services shall not be liable for any direct, indirect, or
          consequential damages resulting from your use of this website or for the
          services provided by third-party insurance carriers.
        </p>

        <h2 className="mt-10 font-display text-2xl text-primary">8. Contact Information</h2>
        <p>If you have questions regarding these Terms or need assistance, please contact us:</p>
        <p>
          Phone: <a className="text-secondary underline" href="tel:+18022101602">+1 802-210-1602</a><br />
          Email: <a className="text-secondary underline" href="mailto:support@legendsinsuranceservices.com">support@legendsinsuranceservices.com</a><br />
          Website: <a className="text-secondary underline" href="https://legendsinsuranceservices.com">https://legendsinsuranceservices.com</a>
        </p>
      </div>
    </article>
  );
}
