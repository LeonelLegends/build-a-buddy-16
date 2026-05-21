import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Legends Insurance Services" },
      {
        name: "description",
        content:
          "How Legends Insurance Services collects, uses, and protects your personal information.",
      },
      { property: "og:title", content: "Privacy Policy — Legends Insurance Services" },
      {
        property: "og:description",
        content: "Our commitment to protecting your privacy and personal data.",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="font-display text-4xl text-primary md:text-5xl">Privacy Policy</h1>
      <p className="mt-3 text-sm text-muted-foreground">Last Updated: 2026</p>

      <div className="prose prose-slate mt-10 max-w-none text-foreground/85">
        <p>
          At Legends Insurance Services, we are committed to protecting your privacy
          and ensuring the security of your personal information. This Privacy Policy
          describes how we collect, use, and safeguard your data, as well as your
          rights regarding your personal information.
        </p>

        <h2 className="mt-10 font-display text-2xl text-primary">1. Information We Collect</h2>
        <p>To provide accurate insurance quotes and services, we collect:</p>
        <ul className="ml-6 list-disc space-y-2">
          <li><strong>Personal Identifiers:</strong> Name, mailing address, email address, and phone number.</li>
          <li><strong>Sensitive Data:</strong> Date of birth, Social Security Number, and driver's license number (where required for underwriting).</li>
          <li><strong>Policy Information:</strong> Details regarding your vehicles, property, or business operations.</li>
        </ul>

        <h2 className="mt-10 font-display text-2xl text-primary">2. Cookies and Tracking Technologies</h2>
        <p>
          Like most professional websites, we use cookies and similar tracking
          technologies to enhance your experience and analyze our traffic.
        </p>
        <ul className="ml-6 list-disc space-y-2">
          <li><strong>What are Cookies?</strong> Cookies are small text files placed on your device to help the website function properly and remember your preferences.</li>
          <li><strong>How We Use Them:</strong> We use "Essential Cookies" for security and site navigation, and "Analytics Cookies" (such as Google Analytics) to understand how visitors interact with our site so we can improve our services.</li>
          <li><strong>Your Choices:</strong> You can set your browser to refuse all or some browser cookies, or to alert you when websites set or access cookies. If you disable or refuse cookies, please note that some parts of this website may become inaccessible or not function properly.</li>
        </ul>

        <h2 className="mt-10 font-display text-2xl text-primary">3. SMS and Mobile Messaging</h2>
        <p>
          By providing your phone number to Legends Insurance Services, you provide
          express written consent to receive communications from us, including text
          messages (SMS).
        </p>
        <ul className="ml-6 list-disc space-y-2">
          <li><strong>Consent:</strong> Consent is obtained via website opt-in forms, written applications, or verbal confirmation.</li>
          <li><strong>Usage:</strong> SMS may be used for policy alerts, claim updates, and appointment reminders.</li>
          <li><strong>Opt-Out:</strong> You may opt-out of SMS communications at any time by texting "STOP" to our number. For assistance, text "HELP".</li>
          <li><strong>Mobile Privacy:</strong> Mobile information, including phone numbers collected for SMS purposes, will not be shared or sold to third parties or affiliates for marketing or promotional purposes. This excludes text messaging originator opt-in data and consent; this information will not be shared with any third parties.</li>
        </ul>

        <h2 className="mt-10 font-display text-2xl text-primary">4. Data Sharing Practices</h2>
        <p>
          We do not sell or rent your personal information to third parties. We only
          share information with insurance carriers and service providers necessary
          to fulfill your insurance requests. We may disclose information if required
          by law or to prevent fraudulent activity.
        </p>

        <h2 className="mt-10 font-display text-2xl text-primary">5. Your Rights and Data Control</h2>
        <p>We provide you with the following rights regarding your data:</p>
        <ul className="ml-6 list-disc space-y-2">
          <li><strong>Access and Correction:</strong> You may request to see or update the information we have on file.</li>
          <li><strong>Deletion:</strong> You may request the deletion of your personal data, subject to legal and regulatory record-keeping requirements that insurance agencies must follow.</li>
          <li><strong>Opt-Out:</strong> You may withdraw consent for marketing communications or SMS at any time.</li>
        </ul>
        <p>
          To exercise any of these rights, please contact us at{" "}
          <a className="text-secondary underline" href="mailto:support@legendsinsuranceservices.com">support@legendsinsuranceservices.com</a>{" "}
          or call us at <a className="text-secondary underline" href="tel:+18022101602">+1 802-210-1602</a>.
        </p>

        <h2 className="mt-10 font-display text-2xl text-primary">6. Data Security</h2>
        <p>
          We employ industry-standard physical, technical, and administrative security
          measures to protect your sensitive information from unauthorized access,
          alteration, or disclosure.
        </p>

        <h2 className="mt-10 font-display text-2xl text-primary">7. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact:</p>
        <p>
          Legends Insurance Services<br />
          Sarasota, FL 34231<br />
          Email: <a className="text-secondary underline" href="mailto:support@legendsinsuranceservices.com">support@legendsinsuranceservices.com</a><br />
          Phone: <a className="text-secondary underline" href="tel:+18022101602">+1 802-210-1602</a>
        </p>
      </div>
    </article>
  );
}
