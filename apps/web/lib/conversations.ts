/**
 * Chat threads — the `conversations` / `messages` tables.
 *
 * Placeholder data until the Socket.IO layer exists (BUILD_PLAN phase 5). A
 * conversation only ever exists between a verified client and a freelancer;
 * two freelancers can never have one (FR-C-2).
 */

export type Conversation = {
  id: string;
  /** The other participant, from the point of view of whoever is reading. */
  withName: string;
  withPhoto: string;
  withRole: "Client" | "Freelancer";
  lastMessage: string;
  when: string;
  unread: number;
};

/** Threads shown to the signed-in freelancer. */
export const FREELANCER_THREADS: Conversation[] = [
  {
    id: "c-1",
    withName: "Sarah J.",
    withPhoto: "/avatars/sarah-j.jpg",
    withRole: "Client",
    lastMessage: "That timeline works for us. Can you start on the 20th?",
    when: "2h ago",
    unread: 2,
  },
  {
    id: "c-2",
    withName: "Michael T.",
    withPhoto: "/avatars/michael-t.jpg",
    withRole: "Client",
    lastMessage: "Thanks for the audit — the team is reading it now.",
    when: "Yesterday",
    unread: 0,
  },
  {
    id: "c-3",
    withName: "Jessica L.",
    withPhoto: "/avatars/jessica-l.jpg",
    withRole: "Client",
    lastMessage: "Could you quote for the dashboard work as well?",
    when: "3 days ago",
    unread: 0,
  },
];

/** Threads shown to the signed-in client. */
export const CLIENT_THREADS: Conversation[] = [
  {
    id: "c-1",
    withName: "Alex Morgan",
    withPhoto: "/avatars/alex-morgan.jpg",
    withRole: "Freelancer",
    lastMessage: "That timeline works for us. Can you start on the 20th?",
    when: "2h ago",
    unread: 0,
  },
  {
    id: "c-4",
    withName: "Sofia Martinez",
    withPhoto: "/avatars/sofia-martinez.jpg",
    withRole: "Freelancer",
    lastMessage: "I've shared the first two screens for review.",
    when: "Yesterday",
    unread: 1,
  },
];

export type Message = {
  id: string;
  /** "me" is whoever is reading the thread. */
  from: "me" | "them";
  body: string;
  at: string;
};

/** Messages keyed by conversation id, oldest first. */
export const MESSAGES: Record<string, Message[]> = {
  "c-1": [
    { id: "m-1", from: "them", body: "Hi Alex — we're rebuilding our marketing site and saw your Next.js post.", at: "Mon 09:14" },
    { id: "m-2", from: "me", body: "Happy to help. Roughly how many pages, and do you already have designs?", at: "Mon 09:31" },
    { id: "m-3", from: "them", body: "Eight pages, designs are in Figma and signed off.", at: "Mon 09:40" },
    { id: "m-4", from: "me", body: "Then two to three weeks is realistic, including a round of revisions.", at: "Mon 10:02" },
    { id: "m-5", from: "them", body: "That timeline works for us. Can you start on the 20th?", at: "Today 08:55" },
  ],
  "c-2": [
    { id: "m-6", from: "them", body: "The audit landed — thank you. Reading it with the team this afternoon.", at: "Yesterday 15:20" },
    { id: "m-7", from: "me", body: "No rush. The bundle-size section is where I'd start.", at: "Yesterday 15:44" },
  ],
  "c-3": [
    { id: "m-8", from: "them", body: "Could you quote for the dashboard work as well?", at: "Fri 11:05" },
  ],
  "c-4": [
    { id: "m-9", from: "them", body: "I've shared the first two screens for review.", at: "Yesterday 17:12" },
  ],
};
