import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal-document";

export const metadata: Metadata = {
  title: "Terms of Service — Trovework",
  description: "The agreement between you and Trovework.",
};

export default function TermsPage() {
  return (
    <LegalDocument
      title="Terms of Service"
      updated="17 August 2026"
      intro={[
        "These Terms of Service (the “Terms”) are a binding agreement between you and Trovework (“Trovework”, “we”, “us”) governing your access to and use of the Trovework website and services (the “Service”).",
        "By creating an account or using the Service, you agree to these Terms. If you do not agree, do not use the Service.",
      ]}
      sections={[
        {
          heading: "Who can use Trovework",
          blocks: [
            "You must be at least 18 years old and able to form a binding contract. You must not be barred from using the Service under the laws of your country or the United States.",
            "You agree to provide accurate information about yourself and to keep it up to date. Every user who interacts on the platform must complete identity verification.",
          ],
        },
        {
          heading: "Your account and identity verification",
          blocks: [
            "To publish a profile, contact another member, or use chat, you must verify your identity. This may include submitting a government-issued ID and a selfie, which are handled as described in our Privacy Policy.",
            "You are responsible for the activity on your account and for keeping your credentials secure. One person may hold one account. Do not impersonate anyone or create accounts on behalf of others without authorisation.",
          ],
        },
        {
          heading: "What Trovework is — and is not",
          blocks: [
            "Trovework is a venue that verifies identities and helps clients and freelancers find one another. We are not a party to any agreement, engagement, or transaction between members, and we do not employ, supervise, direct, or control freelancers or the work they perform.",
            "Any contract for work is solely between the client and the freelancer. You are responsible for evaluating the other party and for your own decisions.",
          ],
        },
        {
          heading: "Contact information and staying on-platform",
          blocks: [
            "Trovework protects members by keeping first contact on the platform. You must not put phone numbers, email addresses, external links, @usernames, or messaging-app handles into public content such as profiles or posts, and you must not attempt to move contact off-platform before the permission rules allow it.",
            "Contact details are released by the system only to a client who has verified their own identity. Sharing prohibited contact information is enforced automatically:",
            {
              list: [
                "First and second violations: a warning, with the exact detected text shown so honest mistakes can be corrected.",
                "Third violation: the account is suspended.",
              ],
            },
            "We may adjust, add to, or remove these controls to protect members and the integrity of the Service.",
          ],
        },
        {
          heading: "Payments are arranged directly between members",
          blocks: [
            "Trovework does not process payments, hold funds, or provide escrow. Any payment is agreed and made directly between the client and the freelancer, off-platform.",
            "Because payment never passes through us, we cannot recover, refund, or guarantee it. Agree your terms — scope, price, and timing — with the other party before work begins.",
          ],
        },
        {
          heading: "Acceptable use",
          blocks: [
            "You agree not to:",
            {
              list: [
                "break any law, or use the Service for fraud, harassment, hate, or harm;",
                "post false, misleading, infringing, or unlawful content;",
                "impersonate any person or misrepresent your identity or affiliation;",
                "circumvent the verification, contact-gating, or anti-abuse controls;",
                "scrape, harvest, or bulk-collect data, or access the Service by automated means without our permission;",
                "interfere with, overload, or attempt to compromise the security of the Service.",
              ],
            },
          ],
        },
        {
          heading: "Reviews and content you provide",
          blocks: [
            "You are responsible for the content you submit, including profiles, posts, messages, and reviews, and you confirm you have the rights to submit it. Reviews must be honest and based on genuine interactions.",
            "You grant Trovework a non-exclusive, worldwide, royalty-free licence to host, display, and distribute the content you submit for the purpose of operating and promoting the Service. You retain ownership of your content.",
          ],
        },
        {
          heading: "What verification does and does not mean",
          blocks: [
            "Identity verification is intended to confirm that a member is a real, identifiable person. It is not a guarantee of skill, honesty, reliability, quality, or suitability for any purpose, and it is not a background check. Use your own judgement as you would in any other professional relationship.",
          ],
        },
        {
          heading: "Disclaimers",
          blocks: [
            "The Service is provided “as is” and “as available” without warranties of any kind, whether express or implied, including implied warranties of merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that the Service will be uninterrupted, error-free, or secure, or that any member, listing, or engagement will meet your expectations.",
          ],
        },
        {
          heading: "Limitation of liability",
          blocks: [
            "To the maximum extent permitted by law, Trovework and its officers, employees, and agents will not be liable for any indirect, incidental, special, consequential, or punitive damages, or for any loss of profits, data, goodwill, or the acts or omissions of any member. Because the Service is provided free of charge, our total aggregate liability arising out of or relating to the Service is limited to the greater of the amount you paid us in the twelve months before the claim (which is normally zero) or USD 100, to the extent permitted by law.",
          ],
        },
        {
          heading: "Indemnification",
          blocks: [
            "You agree to indemnify and hold Trovework harmless from any claims, damages, liabilities, and expenses (including reasonable legal fees) arising out of your use of the Service, your content, your dealings with other members, or your breach of these Terms.",
          ],
        },
        {
          heading: "Suspension and termination",
          blocks: [
            "You may stop using the Service and close your account at any time. We may suspend or terminate your access if you breach these Terms, if required by law, or to protect members or the Service — including automatically under the contact-information rules above.",
          ],
        },
        {
          heading: "Changes to the Service and these Terms",
          blocks: [
            "We may change the Service and these Terms from time to time. If we make a material change, we will take reasonable steps to notify you. Your continued use after a change takes effect means you accept the updated Terms.",
          ],
        },
        {
          heading: "Governing law and disputes",
          blocks: [
            "These Terms are governed by the laws of the United States, without regard to its conflict-of-laws rules. The courts of the United States will have exclusive jurisdiction over any dispute, unless applicable law requires otherwise.",
          ],
        },
        {
          heading: "Contact",
          blocks: [
            "Questions about these Terms can be sent to legal@trovework.com.",
          ],
        },
      ]}
    />
  );
}
