// Edit this list to match Hirenum's actual internship categories.
// The "slug" is what gets stored on the applicant record and is also
// used to pick the matching offer letter template later in the pipeline.

export type Domain = {
  slug: string;
  label: string;
  description: string;
};

export const domains: Domain[] = [
  {
    slug: "content-writing",
    label: "Content Writing",
    description: "LinkedIn posts, articles, and thought-leadership copy.",
  },
  {
    slug: "linkedin-strategy",
    label: "LinkedIn Strategy",
    description: "Positioning, content pillars, and growth strategy.",
  },
  {
    slug: "design",
    label: "Design",
    description: "Visual assets, carousels, and brand collateral.",
  },
  {
    slug: "business-development",
    label: "Business Development",
    description: "Outreach, partnerships, and client growth.",
  },
  {
    slug: "client-success",
    label: "Client Success",
    description: "Onboarding, coordination, and account support.",
  },
];
