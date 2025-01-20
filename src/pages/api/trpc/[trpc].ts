import { createNextApiHandler } from '@trpc/server/adapters/next';

// import { env } from '~/env';
import { appRouter } from '~/server/api/root';
import { createTRPCContext } from '~/server/api/trpc';

// export API handler
export default createNextApiHandler({
  router: appRouter,
  createContext: createTRPCContext,
  // FIXME: this is causing a type error, though it works fine in practice.
  // onError:
  //   env.NODE_ENV === 'development'
  //     ? ({ path, error }) => {
  //         console.error(
  //           `❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`,
  //         );
  //       }
  //     : undefined,
});
