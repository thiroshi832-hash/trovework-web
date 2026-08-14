/**
 * The sample people quoted across the site.
 *
 * One entry per person, so a given name always appears with the same face and
 * job title wherever they are quoted — the landing page's "What Our Users Say"
 * section and the login / register panels all read from here.
 */
export type Person = {
  name: string;
  role: string;
  photo: string;
};

export const PEOPLE = {
  sarah: { name: "Sarah J.", role: "Marketing Manager", photo: "/avatars/sarah-j.jpg" },
  michael: { name: "Michael T.", role: "Full Stack Developer", photo: "/avatars/michael-t.jpg" },
  jessica: { name: "Jessica L.", role: "Startup Founder", photo: "/avatars/jessica-l.jpg" },
  ahmed: { name: "Ahmed R.", role: "Freelance Web Developer", photo: "/avatars/ahmed-r.jpg" },
} satisfies Record<string, Person>;
