import { runPython } from './src/server/api/routers/ask';

runPython('print("Hello, world!")', 1000).then(console.log);
