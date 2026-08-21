import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal-document";

export const metadata: Metadata = {
  title: "Privacy Policy — Trovework",
  description: "What Trovework collects, why, how it is protected, and how long it is kept.",
};

export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Privacy Policy"
      updated="17 August 2026"
      intro={[
        "This Privacy Policy explains what personal information Trovework (“we”, “us”) collects, why we collect it, how we protect it, and the choices you have.",
        "We ask for more than most sites — including a photo of your ID and a selfie — so you deserve a straight answer about where it goes.",
      ]}
      sections={[
        {
          heading: "Information we collect",
          blocks: [
            {
              list: [
                "Account details: your name, email address, role, and general location (country, state/province, postal code).",
                "Identity verification: a government-issued ID image, a selfie, and the ID number and date of birth you enter, used to confirm you are who you say you are.",
                "Phone number: collected to send a one-time verification code.",
                "Profile and content: your headline, bio, skills, rate, photo, posts, reviews, and the messages you send through chat.",
                "Contact handles: optional Telegram, Discord, or WhatsApp handles, which are gated (see below).",
                "Technical data: cookies needed to keep you signed in and to remember your language, plus basic logs and security information.",
              ],
            },
            "If you sign in with Google, we receive your name, email address, and a Google account identifier from Google — we do not receive your Google password.",
          ],
        },
        {
          heading: "How we use your information",
          blocks: [
            {
              list: [
                "to verify your identity and operate the trust and safety controls;",
                "to run the Service — your profile, search, chat, and reviews;",
                "to gate contact details so they are released only to verified clients;",
                "to detect and prevent abuse, fraud, and prohibited off-platform contact sharing;",
                "to send you service messages, such as a phone verification code or a password-reset link;",
                "to meet legal obligations.",
              ],
            },
          ],
        },
        {
          heading: "Your ID image and selfie",
          blocks: [
            "We use your ID and selfie to check that the face matches the document and that the details match what you entered. They are stored in a secured location that is never served on the public web and never shown on your profile or given to another member.",
            "Where an automated check is used, it compares the faces and reads the document text; it may be reviewed by a trained administrator. Sensitive fields such as your ID number and date of birth are encrypted at rest.",
          ],
        },
        {
          heading: "How your information is protected",
          blocks: [
            {
              list: [
                "Passwords are stored only as salted hashes, never in plain text.",
                "Session and password-reset tokens are stored hashed, so a database read cannot be replayed.",
                "ID number and date of birth are encrypted at rest (AES-256-GCM).",
                "ID images and selfies live outside the web root and are never publicly served.",
                "Access to verification data is limited to the purpose of reviewing it.",
              ],
            },
            "No system is perfectly secure, but we take reasonable technical and organisational measures to protect your information.",
          ],
        },
        {
          heading: "What is public and what is not",
          blocks: [
            "Your display name, headline, skills, rate, reviews, and active service posts are public — that is the point of a marketplace profile. Your ID, selfie, ID number, date of birth, phone number, email, and exact address are not public.",
            "Your Telegram, Discord, and WhatsApp handles are released by the system only to a client who has verified their own identity.",
          ],
        },
        {
          heading: "Legal bases (where applicable)",
          blocks: [
            "Where data-protection law such as the GDPR applies, we rely on: performing our contract with you (to provide the Service), your consent (for example, for identity verification), our legitimate interests (trust, safety, and fraud prevention), and compliance with legal obligations.",
          ],
        },
        {
          heading: "Who we share it with",
          blocks: [
            "We do not sell your personal information. There is no advertising business here to sell it to. We share limited data with service providers who help us run the Service, only as needed, including:",
            {
              list: [
                "seven.io, our SMS provider, to deliver your phone verification code;",
                "an email provider, to deliver messages such as password-reset links;",
                "Google, if you choose to sign in with Google.",
              ],
            },
            "We may disclose information if required by law or to protect the rights, safety, and security of members and the Service.",
          ],
        },
        {
          heading: "How long we keep it",
          blocks: [
            "We keep your information for as long as your account is active and as needed to provide the Service. If you ask us to delete your account, we delete your personal information, including your ID images, except where we are required by law to retain a limited record — in which case we will tell you what we keep and for how long.",
          ],
        },
        {
          heading: "Your rights",
          blocks: [
            "Depending on where you live, you may have the right to access, correct, delete, export, or restrict the processing of your personal information, and to object or withdraw consent. To exercise these rights, contact us at privacy@trovework.com. We may need to verify your identity before acting on a request.",
          ],
        },
        {
          heading: "Cookies",
          blocks: [
            "We use a small number of cookies that are necessary to run the Service: an authentication cookie to keep you signed in, and a cookie to remember your language. We do not use advertising or third-party tracking cookies.",
          ],
        },
        {
          heading: "International transfers",
          blocks: [
            "Trovework operates globally, so your information may be processed in a country other than your own. Where required, we take steps to ensure your information receives an adequate level of protection.",
          ],
        },
        {
          heading: "Children",
          blocks: [
            "The Service is not intended for anyone under 18, and we do not knowingly collect information from children. If you believe a child has provided us information, contact us and we will delete it.",
          ],
        },
        {
          heading: "Changes to this policy",
          blocks: [
            "We may update this Privacy Policy from time to time. If we make a material change, we will take reasonable steps to notify you, and the “last updated” date above will change.",
          ],
        },
        {
          heading: "Contact",
          blocks: [
            "For any privacy question or request, contact us at privacy@trovework.com.",
          ],
        },
      ]}
    />
  );
}
