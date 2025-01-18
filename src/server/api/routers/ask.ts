import { z } from 'zod';

import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';
import { docker, openai } from '~/utils/clients';

const zQuestion = z.object({
  image: z.string(),
});

const image = 'python:3.10-slim';

export async function runPython(
  code: string,
  timeoutMs = 5000,
): Promise<string> {
  let container;
  try {
    container = await docker.createContainer({
      Image: image,
      Cmd: ['python3', '-c', code],
      HostConfig: {
        Memory: 128 * 1024 * 1024, // 128MB
        NanoCpus: 500000000, // 0.5 CPU
      },
      Tty: false,
    });
  } catch (err) {
    console.error('Error creating container:', err);
    throw err;
  }

  await container.start();

  let logs = '';
  let timedOut = false;

  const stream = await container.attach({
    stream: true,
    stdout: true,
    stderr: true,
  });
  stream.on('data', (chunk) => {
    logs += chunk.toString();
  });

  const waitPromise = container.wait();
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      timedOut = true;
      console.log('Container timed out');
      reject(new Error(`Container timed out after ${timeoutMs} ms`));
    }, timeoutMs);
  });

  try {
    await Promise.race([waitPromise, timeoutPromise]);
  } catch (err) {
    if (timedOut) {
      // Force kill the container if timed out
      await container.kill();
    }
    throw err;
  }

  // 5. Remove the container (so it doesn't linger)
  await container.remove({ force: true });

  return logs;
}

export const questionRouter = createTRPCRouter({
  ask: publicProcedure.input(zQuestion).mutation(async ({ input }) => {
    const chatCompletion = await openai.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Your job is to solve the math problem in the attached image. Output ONLY vanilla Python code (no libraries) to perform the calculations to solve the problem. The output of the Python program will be provided back to you after execution. You can use print statements with optional labels to gain insight on a step-by-step basis in order to provide the user with a step-by-step solution to the problem. Remember to always print the result of the final calculation.',
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

    if (!result) {
      throw new Error('No result from OpenAI');
    }

    // Run the Python code
    const pythonLogs = await runPython(result);

    console.log({ result, pythonLogs });

    return { pythonLogs };
  }),
});
