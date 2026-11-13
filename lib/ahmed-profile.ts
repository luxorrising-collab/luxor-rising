// Ahmed's profile by Luxor Rising: one source for the concierge band (as
// expandable info) and the welcome card that appears once a guest picks a date.
// It reads as one continuous text about Ahmed; only Marian's own experiences
// are set apart, as his marked quotes.

export type ProfileBlock = { kind: "text"; text: string } | { kind: "quote"; text: string };

export const AHMED = {
  name: "Ahmed",
  role: "Head of Egyptian operations",
  /** The round portrait used for the Insider's Guide author. */
  avatar: "/images/about/ahmed-avatar.jpg",
  headline: "Your own person in Egypt.",
  quoteBy: "Marian, founder of Luxor Rising",
  blocks: [
    {
      kind: "text",
      text: "The person who makes every Luxor Rising day real on the ground in Egypt. A driver, fixer, haggler and negotiator, born and raised here, with a deep passion for the place and the practical knowledge to match. A good person, a friend, a brother, and well connected with friends all over the ground.",
    },
    {
      kind: "text",
      text: "He is a guide in the deeper sense of the word: he can open the doors of the mighty temples of Luxor and Aswan for you, and show you how to sail the Nile at sunset. An adventurer at heart, with a light heart and unbroken faith. Someone you can share your journey with and speak your truth with, who listens openly and understands deeply, and someone you can call in an emergency, who starts solving it at once.",
    },
    {
      kind: "quote",
      text: "Every issue I had was attended to immediately. He made sure I was well taken care of at all times, even at my accommodation.",
    },
    {
      kind: "text",
      text: "He makes you feel so welcome that leaving feels like leaving home, and the friendship does not end when the trip does.",
    },
    {
      kind: "quote",
      text: "A year after my trip we are still in contact almost daily, and I love to call him. He brought me to Medinet Habu at first light, so I could experience the power of the place I was asking for. After I did, I asked him if he felt it too. I saw that he did, and that he understood. To experience this with Ahmed was a blessing, and I am forever grateful for that.",
    },
  ] as ProfileBlock[],
};
