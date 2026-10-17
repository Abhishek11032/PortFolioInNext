export type Project = {
  number: string;
  name: string;
  category: string;
  icon: string;
  description: string;
  evidence?: string;
  image?: string;
  imageAlt?: string;
  imageCaption?: string;
  featured: boolean;
  technologies?: readonly string[];
  features?: readonly string[];
  showFeaturesByDefault?: boolean;
};

export type SkillGroup = {
  title: string;
  icon: string;
  skills: readonly string[];
};

export type SocialLink = {
  label: string;
  href: string;
  icon: string;
};
