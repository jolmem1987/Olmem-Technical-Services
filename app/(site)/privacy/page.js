import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy',
  description: 'How Olmem Technical Services handles personal information collected through this website and its customer portal.',
};

/**
 * The privacy policy.
 *
 * Written from what these systems actually do rather than from a template. Each
 * paragraph corresponds to something real: the contact form writes to a
 * database and sends an email, the assistant answers from a fixed knowledge
 * base, the portal runs on Stripe for payments. If a change to the software
 * makes a sentence here untrue, the sentence is the thing that is wrong.
 */
export default function Privacy() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">LEGAL</span>
          <h1>Privacy Policy</h1>
          <p>Last updated 2 October 2026</p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: '820px' }}>
          <h2>Who we are</h2>
          <p>
            Olmem Technical Services is an independent industrial maintenance provider. This policy
            covers this website and the customer portal where our customers view their work and pay
            invoices.
          </p>
          <p>
            Almost everything we hold is business information about the companies we work for. The
            personal information involved is mostly the names and work contact details of the people
            who arrange maintenance work.
          </p>

          <h2>What this website collects</h2>
          <p>
            <strong>When you send us a service request.</strong> The form asks for your name,
            company, email address, phone number, the type of support you need and a description of
            the problem. That goes into our own database and is emailed to us. We use it to respond
            to you and to carry out the work.
          </p>
          <p>
            <strong>When you use the site assistant.</strong> It answers from a fixed set of
            information about our services. What you type is used to produce an answer and, if you
            ask us to get in touch, to create a request in the same way the form does. The assistant
            is not an AI that learns from your conversation.
          </p>
          <p>
            <strong>We do not use advertising cookies, tracking pixels, or third-party analytics on
            this website.</strong> Nothing here follows you to another site. The only cookie we set
            is a sign-in cookie for our own staff on the administration pages.
          </p>

          <h2>What the customer portal collects</h2>
          <p>
            If you have a portal account, we hold your name, job title, work email and phone number,
            and a password stored only as a cryptographic hash that cannot be read back. We also
            hold the work itself: service requests, work orders, equipment history, hours, parts,
            quotes, contracts and invoices, along with photographs or documents attached to a job,
            and signatures captured on a device when somebody acknowledges hours or approves
            completed work.
          </p>
          <p>
            Signing in creates a session record containing your IP address, your browser&rsquo;s
            user-agent string, and when the session was created and last used. Actions taken in the
            system are written to an append-only audit record, so a disputed invoice or a changed
            record has a history.
          </p>

          <h2>Payments</h2>
          <p>
            Payments are processed by Stripe. Card and bank details are entered directly into
            Stripe and never reach our servers.{' '}
            <strong>
              We do not receive, store or log a card number, security code, bank account number or
              routing number, and we could not retrieve one if asked.
            </strong>
          </p>
          <p>
            What we keep is the record of a payment: the amount, the date, whether it was a bank
            payment or a card, the card brand and last four digits or the bank name and last four
            digits, and Stripe&rsquo;s reference for the transaction.
          </p>

          <h2>Who else handles your information</h2>
          <p>These are the services our systems rely on, and what each one sees:</p>
          <ul className="check-list">
            <li><strong>Stripe</strong> — payment processing. Receives payment details directly, with the invoice number and amount.</li>
            <li><strong>Neon</strong> — the database, hosted in the United States.</li>
            <li><strong>Vercel</strong> — hosting, and file storage for photographs and documents attached to jobs.</li>
            <li><strong>Google Workspace</strong> — our email, through which notifications and invoices are sent.</li>
          </ul>
          <p>
            Each is used because the systems need it to work. We do not sell personal information,
            we do not share it for advertising, and we do not use it to build a profile of you for
            any purpose unrelated to the work.
          </p>

          <h2>How long we keep it</h2>
          <p>
            Work orders, invoices, payments and the audit trail are business records, kept for as
            long as we are required to keep them for tax, accounting and contractual purposes —
            generally at least seven years. Enquiries that do not become work are kept while they
            are useful and then removed. Sessions expire on their own.
          </p>

          <h2>How it is protected</h2>
          <ul className="check-list">
            <li>Everything travels over an encrypted connection.</li>
            <li>Passwords are stored only as hashes.</li>
            <li>Each customer&rsquo;s data is separated at the database level, not merely hidden in the interface.</li>
            <li>Access is limited by role, and portal accounts see only their own company&rsquo;s work.</li>
            <li>Payment credentials are never in our possession to lose.</li>
          </ul>

          <h2>Your choices</h2>
          <p>
            You can ask us what we hold about you, ask us to correct it, ask for a copy, or ask us
            to close a portal account. Depending on where you live you may have further rights,
            including in some US states the right to know what is collected and to ask for deletion.
            Where a record has to be kept for legal or accounting reasons we will say so plainly
            rather than quietly refusing.
          </p>

          <h2>Children</h2>
          <p>
            These are systems for businesses. They are not intended for anyone under 18, and we do
            not knowingly collect information about children.
          </p>

          <h2>Changes</h2>
          <p>
            If this policy changes, the date at the top changes with it. If a change materially
            affects how we handle your information, we will tell customers with portal accounts
            rather than relying on you to re-read this page.
          </p>

          <h2>Contact us</h2>
          <p>
            Questions about this policy, or about information we hold, can go to{' '}
            <Link href="/contact">our contact page</Link>, or by email and phone using the details
            in the footer below.
          </p>
        </div>
      </section>
    </>
  );
}
