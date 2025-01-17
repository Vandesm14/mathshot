import { z } from 'zod';

import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';
import { openai } from '~/utils/clients';

const zQuestion = z.object({
  image: z.string(),
});

export const questionRouter = createTRPCRouter({
  ask: publicProcedure.input(zQuestion).query(async ({ input }) => {
    const chatCompletion = await openai.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Describe what you see in the image.',
            },
            {
              type: 'image_url',
              image_url: {
                url: input.image,
              },
            },
          ],
        },
      ],
      model: 'gpt-4o-mini',
    });

    const result = chatCompletion.choices[0]?.message.content;
    return { result };
  }),
});
