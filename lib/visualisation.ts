// The brand-film clips (public/videos/{desert,medinet,nile,sky,temple}) are AI
// visualisations, not footage from a real day. Wherever one shows a model or a
// couple in a gallery, we say so — and that a guest can have shots like it with
// a professional photographer or videographer. The table spreads show no one,
// and the real footage (public/videos/real) is never marked.
const AI_CLIP = /^\/videos\/(desert|medinet|nile|sky|temple)\/[^/]+\.mp4$/;
const NO_PEOPLE = /\/table\.mp4$/;

export const isPeopleVisualisation = (video?: string) =>
  !!video && AI_CLIP.test(video) && !NO_PEOPLE.test(video);

/** Short line for a gallery tile. */
export const VISUALISATION_TAG = "Visualisation · yours with a pro photographer";
/** Full line for the enlarged view. */
export const VISUALISATION_NOTE =
  "A visualisation. Add a professional photographer or videographer to your day, and your own moments can be captured just like this.";
