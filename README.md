# Mathshot

Take a picture of any math problem and get step-by-step instructions in under a minute.

## Installation

1. Clone the repo:

```
git clone https://github.com/vandesm14/mathshot
```

2. Install the dependencies (`pnpm` is used here but it can be substituded for `yarn` or `npm`):

```bash
pnpm i
```

3. Add your OpenAI API key (requires read/write access to LLM capabilities):

```bash
# .env
OPENAI_API_KEY="abcdefg1234567890"
```

4. Build the app:

```bash
pnpm build
```

5. Run the app:

```bash
pnpm start
```
