/**
 * Site-level identity used for E-E-A-T signals: the About page, author bylines,
 * Person/Organization schema, and metadata `authors`.
 *
 * For a YMYL (financial) site Google weighs a real, named human far more than a
 * "Team" byline. Everything here must stay truthful — never pad it with
 * credentials or claims that can't be backed up.
 */
export const SITE_AUTHOR = {
  /** Full name of the person behind the site. */
  name: 'Shishir Adhikari',
  /** Short role line shown under the name. */
  role: 'Founder, WealthAlgor · Senior Full-Stack Developer',
  /** Photo, copied from adhikarishishir.com.np/images/shishir.jpeg. */
  image: '/shishir-adhikari.jpeg',
  /**
   * `object-position` for the photo. It is a full-body 1200x1600 shot with the
   * face near the top, so a default centered crop into a circle would frame the
   * torso. Keep this in sync if the photo is ever replaced.
   */
  imagePosition: '50% 18%',
  /** 1–2 sentences: relevant background and why you can speak to this topic. */
  bio: 'Shishir Adhikari is a senior full-stack developer with around four years of professional experience, and he builds and maintains every calculator on WealthAlgor himself. He reads robo-advisor fee schedules and disclosure documents directly, then models them in code so the numbers on this site can be checked rather than taken on trust.',
  /**
   * Longer version used on the About page, where there is room to be specific
   * about what the background does and does not qualify him to say.
   */
  bioLong:
    'I am a senior full-stack developer with around four years of professional experience — building government data portals, healthcare systems and e-commerce platforms across the MERN/PERN stack — and I am not a licensed financial adviser. That distinction shapes what this site is. My background is in building software that has to be correct: reading a primary source, modelling it precisely, and showing the working. That is exactly the skill a fee comparison needs, because the hard part of "which robo-advisor is cheaper" is not opinion, it is arithmetic over a fee schedule that most write-ups round off or copy from each other.',
  /** Profile URLs used for `sameAs` in Person schema. */
  sameAs: [
    'https://adhikarishishir.com.np/',
    'https://github.com/adkshishir',
    'https://www.linkedin.com/in/shishir-adhikari-917432254/',
    'https://www.facebook.com/shishir0605',
  ] as string[],
  /** Personal site, linked from the About page as the primary identity proof. */
  website: 'https://adhikarishishir.com.np/',
  /**
   * Public contact address. Published on the About page and in Person schema, so
   * it must be a mailbox that is actually monitored — corrections arrive here.
   * Setting this to '' falls the About page back to the /contact form.
   */
  email: 'adhikarishishir50@gmail.com',
} as const;

/** Date the platform fee figures baked into the calculators were last verified. */
export const FEE_DATA_VERIFIED = '2026-08-04';
