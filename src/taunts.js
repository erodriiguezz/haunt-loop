// What Nullie says after you die. Playful, not cruel.
const EARLY = [
  "skill issue?",
  "have you tried turning it off and on again?",
  "works on my machine.",
  "that's a feature.",
  "LGTM. ship it.",
  "404: skill not found",
  "did you read the spec?",
  "git blame: you",
  "it compiled, didn't it?",
  "retrying with exponential backoff...",
  "closing as won't fix.",
  "we'll fix it in prod.",
  "null pointer. hey, that's me!",
  "ctrl+z won't save you.",
  "add it to the backlog.",
];
const BY_CAUSE = {
  fell: ["mind the gap.", "the floor was a suggestion.", "falling is just flying, badly."],
  spikes: ["pointy, weren't they?", "spikes: 1, you: 0", "that's a sharp regression."],
  crushed: ["the ceiling had other plans.", "heavy refactor incoming.", "flattened. like your roadmap."],
  restart: ["rage quit counts too.", "giving up already?", "a fresh start. same result."],
};

let last = "";
export function pickTaunt(deaths, cause) {
  if (deaths === 10) return "10 deaths. new personal best?";
  if (deaths === 25) return "25. at this point it's a lifestyle.";
  if (deaths === 50) return "50 deaths. Nullie is genuinely impressed.";
  const pool = Math.random() < 0.4 && BY_CAUSE[cause] ? BY_CAUSE[cause] : EARLY;
  let s;
  do s = pool[Math.floor(Math.random() * pool.length)]; while (s === last && pool.length > 1);
  return (last = s);
}

export function verdict(deaths) {
  if (deaths < 15) return "suspiciously few deaths. did you read the source?";
  if (deaths < 60) return "a perfectly normal amount of suffering.";
  return "you and Nullie should get coffee sometime.";
}
