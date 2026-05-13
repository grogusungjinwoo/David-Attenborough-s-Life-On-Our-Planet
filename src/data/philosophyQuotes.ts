export type PhilosophyQuote = {
  id: string;
  author: "Plato";
  text: string;
  context: string;
};

export const platoQuotes: PhilosophyQuote[] = [
  {
    id: "plato-beginning",
    author: "Plato",
    text: "The beginning is the most important part of the work.",
    context: "The Republic"
  },
  {
    id: "plato-wonder",
    author: "Plato",
    text: "Wonder is the feeling of a philosopher.",
    context: "Theaetetus"
  },
  {
    id: "plato-examined-life",
    author: "Plato",
    text: "The unexamined life is not worth living.",
    context: "Apology"
  },
  {
    id: "plato-learning",
    author: "Plato",
    text: "Do not train a child to learn by force, but direct them to it by what amuses their minds.",
    context: "The Republic"
  }
];

export function getRandomPlatoQuote(previousId?: string) {
  const candidates =
    platoQuotes.length > 1
      ? platoQuotes.filter((quote) => quote.id !== previousId)
      : platoQuotes;

  return candidates[Math.floor(Math.random() * candidates.length)];
}
