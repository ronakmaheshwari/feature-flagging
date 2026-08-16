Yes. For a production Node.js app, I'd use Ollama's HTTP API with `fetch`, an API key from environment variables, timeout handling, and useful error messages.

Assuming you're using **ES modules**:

```js
// services/ollama.service.js

const OLLAMA_API_URL =
  process.env.OLLAMA_API_URL || "https://ollama.com/api/generate";

const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY;

const OLLAMA_MODEL =
  process.env.OLLAMA_MODEL || "your-model";

const REQUEST_TIMEOUT = 60_000; // 60 seconds


export async function generateWithOllama(prompt, options = {}) {
  if (!OLLAMA_API_KEY) {
    throw new Error("OLLAMA_API_KEY is not configured");
  }

  if (!prompt || typeof prompt !== "string") {
    throw new Error("A valid prompt is required");
  }

  const {
    model = OLLAMA_MODEL,
    temperature = 0.7,
    system,
  } = options;

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT);

  try {
    const response = await fetch(OLLAMA_API_URL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OLLAMA_API_KEY}`,
      },

      body: JSON.stringify({
        model,
        prompt,
        stream: false,

        options: {
          temperature,
        },

        ...(system && {
          system,
        }),
      }),

      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        `Ollama API error (${response.status}): ${errorText}`
      );
    }

    const data = await response.json();

    if (!data.response) {
      throw new Error("Ollama returned an empty response");
    }

    return data.response;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(
        "Ollama request timed out after 60 seconds"
      );
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
```

### `.env`

```env
OLLAMA_API_KEY=your_ollama_cloud_api_key
OLLAMA_MODEL=your-model-name
OLLAMA_API_URL=https://ollama.com/api/generate
```

Don't commit `.env` to Git.

### Usage

Then your content service can stay very clean:

```js
import { generateWithOllama } from "./ollama.service.js";

const prompt = `
Create a LinkedIn post about AI agents for SaaS founders.

Tone: thought leadership
Goal: educate
Length: medium

Return only the post.
`;

const content = await generateWithOllama(prompt);

console.log(content);
```

### Better version for your content generator

Since you're building a **LinkedIn/X content platform**, I'd actually make the service accept structured generation options:

```js
const result = await generateWithOllama(prompt, {
  model: process.env.OLLAMA_MODEL,
  temperature: 0.8,
  system: `
    You are an expert social media content strategist.
    Write engaging, authentic social media content.
    Never use generic AI-sounding language.
  `,
});
```

Then your architecture becomes:

```text
content.controller.js
        ↓
content.service.js
        ↓
prompt.service.js
        ↓
ollama.service.js
        ↓
Ollama Cloud
```

The important part is that **`ollama.service.js` knows nothing about LinkedIn or X**. It only knows how to communicate with Ollama. Your prompt/content services handle the platform-specific intelligence.

One thing I'd change before putting this into production: **use Ollama's structured JSON output** for your generator, so you can reliably get `{ hook, content, cta, hashtags }` instead of trying to parse arbitrary model text.


Yes. For a production Node.js app, I'd use Ollama's HTTP API with `fetch`, an API key from environment variables, timeout handling, and useful error messages.

Assuming you're using **ES modules**:

```js
// services/ollama.service.js

const OLLAMA_API_URL =
  process.env.OLLAMA_API_URL || "https://ollama.com/api/generate";

const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY;

const OLLAMA_MODEL =
  process.env.OLLAMA_MODEL || "your-model";

const REQUEST_TIMEOUT = 60_000; // 60 seconds


export async function generateWithOllama(prompt, options = {}) {
  if (!OLLAMA_API_KEY) {
    throw new Error("OLLAMA_API_KEY is not configured");
  }

  if (!prompt || typeof prompt !== "string") {
    throw new Error("A valid prompt is required");
  }

  const {
    model = OLLAMA_MODEL,
    temperature = 0.7,
    system,
  } = options;

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT);

  try {
    const response = await fetch(OLLAMA_API_URL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OLLAMA_API_KEY}`,
      },

      body: JSON.stringify({
        model,
        prompt,
        stream: false,

        options: {
          temperature,
        },

        ...(system && {
          system,
        }),
      }),

      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        `Ollama API error (${response.status}): ${errorText}`
      );
    }

    const data = await response.json();

    if (!data.response) {
      throw new Error("Ollama returned an empty response");
    }

    return data.response;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(
        "Ollama request timed out after 60 seconds"
      );
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
```

### `.env`

```env
OLLAMA_API_KEY=your_ollama_cloud_api_key
OLLAMA_MODEL=your-model-name
OLLAMA_API_URL=https://ollama.com/api/generate
```

Don't commit `.env` to Git.

### Usage

Then your content service can stay very clean:

```js
import { generateWithOllama } from "./ollama.service.js";

const prompt = `
Create a LinkedIn post about AI agents for SaaS founders.

Tone: thought leadership
Goal: educate
Length: medium

Return only the post.
`;

const content = await generateWithOllama(prompt);

console.log(content);
```

### Better version for your content generator

Since you're building a **LinkedIn/X content platform**, I'd actually make the service accept structured generation options:

```js
const result = await generateWithOllama(prompt, {
  model: process.env.OLLAMA_MODEL,
  temperature: 0.8,
  system: `
    You are an expert social media content strategist.
    Write engaging, authentic social media content.
    Never use generic AI-sounding language.
  `,
});
```

Then your architecture becomes:

```text
content.controller.js
        ↓
content.service.js
        ↓
prompt.service.js
        ↓
ollama.service.js
        ↓
Ollama Cloud
```

The important part is that **`ollama.service.js` knows nothing about LinkedIn or X**. It only knows how to communicate with Ollama. Your prompt/content services handle the platform-specific intelligence.

One thing I'd change before putting this into production: **use Ollama's structured JSON output** for your generator, so you can reliably get `{ hook, content, cta, hashtags }` instead of trying to parse arbitrary model text.
