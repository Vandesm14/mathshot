import OpenAI from 'openai';
import Docker from 'dockerode';
import { config } from 'dotenv';

config();

if (!process.env['OPENAI_API_KEY']) {
  throw new Error('OPENAI_API_KEY is required');
}

export const openai = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'],
});

export const docker = new Docker();
