import { z } from 'zod';

import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';
import { openai } from '~/utils/clients';
import { exec } from 'child_process';
import { promisify } from 'util';
import {
  ChatCompletion,
  ChatCompletionMessageParam,
} from 'openai/resources/index.mjs';

const zQuestion = z.object({
  image: z.string(),
});

const image = 'python:3.10-slim';

export async function runPython(
  code: string,
  timeoutMs = 5000,
): Promise<string> {
  const execPromise = promisify(exec);
  const containerName = `python_runner_${Date.now()}`;
  const command = `docker run --name ${containerName} -l -d --memory=128m --cpus=0.5 ${image} python3 -c "${code.replace(/"/g, '\\"')}"`;

  let logs = '';
  let timedOut = false;

  const timeoutPromise = () =>
    new Promise<never>((_, reject) => {
      setTimeout(async () => {
        timedOut = true;
        console.log('Container timed out');
        try {
          await execPromise(`docker kill ${containerName}`);
        } catch (e) {
          console.error('Error killing container:', e);
        }
        reject(new Error(`Container timed out after ${timeoutMs} ms`));
      }, timeoutMs);
    });

  try {
    console.log('Running command:', command);
    const { stdout, stderr } = await Promise.race([
      execPromise(command),
      timeoutPromise(),
    ]);
    // const { stdout, stderr } = await execPromise(command);
    logs = stdout + stderr;
    console.log('Logs:', logs);
  } catch (err) {
    if (timedOut) {
      console.log('Execution timed out');
    } else {
      console.error('Error creating container:', err);
    }
    throw err;
  } finally {
    // Remove the container (so it doesn't linger)
    await execPromise(`docker rm -f ${containerName}`);
  }

  return logs;
}

export const questionRouter = createTRPCRouter({
  ask: publicProcedure.input(zQuestion).mutation(async ({ input }) => {
    let chatCompletion: ChatCompletion;
    let messages: ChatCompletionMessageParam[] = [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Your job is to solve the math problem in the attached image. Output ONLY vanilla Python code (no libraries) to perform the calculations to solve the problem. The output of the Python program will be provided back to you after execution. You can use print statements with optional labels to gain insight on a step-by-step basis in order to provide the user with a step-by-step solution to the problem. Remember to always print the result of the final calculation. Remember to utilize print statements so you can provide a step-by-step solution later on. Do not use code fences or delimiters. Your output should be Python code ONLY.',
          },
          {
            type: 'image_url',
            image_url: {
              url: input.image,
            },
          },
        ],
      },
    ];

    try {
      chatCompletion = await openai.chat.completions.create({
        messages,
        model: 'gpt-4o-mini',
      });
    } catch (e) {
      console.error('Error with OpenAI:', e);

      // TODO: show a better error
      return 'Error with OpenAI';
    }

    let result = chatCompletion.choices[0]?.message.content;

    if (!result) {
      throw new Error('No result from OpenAI');
    }

    // Run the Python code
    const pythonLogs = await runPython(result);

    console.log({ result, pythonLogs });

    messages.push({
      role: 'assistant',
      content: result,
    });

    messages.push({
      role: 'user',
      content: `Utilizing the output of your Python code, provide a step-by-step guide on how the problem was solved. Code output:\n${pythonLogs}`,
    });

    try {
      chatCompletion = await openai.chat.completions.create({
        messages,
        model: 'gpt-4o-mini',
      });
    } catch (e) {
      console.error('Error with OpenAI:', e);
    }

    result = chatCompletion.choices[0]?.message.content;

    console.log({ result });

    return result;
  }),
});
