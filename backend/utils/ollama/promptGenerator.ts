type Platform = "LinkedIn" | "X" | "Instagram" | "Threads" | "Facebook" | "Blog";

interface PlatformSpec {
  name: string;
  tone: string;
  goal: string;
  length: string;
  charLimit: number;
  hashtagCount: string;
  formatNotes: string;
}

const PLATFORM_SPECS: Record<Platform, PlatformSpec> = {
  LinkedIn: {
    name: "LinkedIn",
    tone: "thought leadership, professional but conversational",
    goal: "educate and build authority",
    length: "medium (150–300 words)",
    charLimit: 3000,
    hashtagCount: "3–5 relevant hashtags at the end",
    formatNotes: "Use short paragraphs (1–3 lines), a strong hook as the first line, and line breaks for readability. No markdown formatting.",
  },
  X: {
    name: "X (Twitter)",
    tone: "punchy, direct, opinionated",
    goal: "spark engagement and discussion",
    length: "short (1 tweet, or a 3–5 tweet thread if noted)",
    charLimit: 280,
    hashtagCount: "0–2 hashtags max, only if highly relevant",
    formatNotes: "Lead with the sharpest line. Avoid corporate tone. No markdown formatting.",
  },
  Instagram: {
    name: "Instagram",
    tone: "casual, visual-first, relatable",
    goal: "engage and entertain while informing",
    length: "medium caption (100–200 words)",
    charLimit: 2200,
    hashtagCount: "8–15 hashtags, placed after a line break at the end",
    formatNotes: "Use emojis sparingly for visual breaks. First 1–2 lines must hook before the 'more' cutoff.",
  },
  Threads: {
    name: "Threads",
    tone: "conversational, informal",
    goal: "start a discussion",
    length: "short (under 500 characters)",
    charLimit: 500,
    hashtagCount: "0–1 hashtag",
    formatNotes: "Sound like a real person thinking out loud, not a brand.",
  },
  Facebook: {
    name: "Facebook",
    tone: "friendly, community-oriented",
    goal: "drive comments and shares",
    length: "medium (100–250 words)",
    charLimit: 63206,
    hashtagCount: "1–3 hashtags",
    formatNotes: "Ask a question at the end to prompt comments.",
  },
  Blog: {
    name: "Blog intro",
    tone: "informative, structured",
    goal: "hook the reader into reading the full article",
    length: "long (300–500 words)",
    charLimit: 10000,
    hashtagCount: "none",
    formatNotes: "Include a clear hook, 2–3 subheadings implied by structure, no hashtags.",
  },
};

interface TemplateOptions {
  topic: string;
  audience?: string;
  tone?: string;       
  goal?: string;       
  callToAction?: string;
  includeHashtags?: boolean;
}

const templateGenerator = (
  platform: Platform,
  options: TemplateOptions
): string => {
  const spec = PLATFORM_SPECS[platform];
  if (!spec) {
    throw new Error(`Unsupported platform: ${platform}`);
  }

  const {
    topic,
    audience = "the target audience",
    tone = spec.tone,
    goal = spec.goal,
    callToAction,
    includeHashtags = true,
  } = options;

  if (!topic || typeof topic !== "string") {
    throw new Error("A valid topic is required");
  }

  return `
    Create a ${spec.name} post about "${topic}" for ${audience}.

    Tone: ${tone}
    Goal: ${goal}
    Length: ${spec.length}
    Character limit: strictly under ${spec.charLimit} characters
    Hashtags: ${includeHashtags ? spec.hashtagCount : "do not include any hashtags"}
    Format notes: ${spec.formatNotes}
    ${callToAction ? `Call to action: end with — ${callToAction}` : ""}

    Return only the post text, with no preamble, explanation, or markdown formatting.
    `.trim();
};

export default templateGenerator;