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
