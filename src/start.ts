import { createCsrfMiddleware, createMiddleware, createStart } from '@tanstack/react-start'
import { authkitMiddleware } from '@workos/authkit-tanstack-react-start'
import { isWorkOSConfigured } from './lib/env'

const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === 'serverFn',
})

const noopAuthMiddleware = createMiddleware().server(async (args) =>
  args.next({
    context: {
      auth: () => undefined,
    },
  }),
)

export const startInstance = createStart(() => ({
  requestMiddleware: isWorkOSConfigured()
    ? [csrfMiddleware, authkitMiddleware()]
    : [csrfMiddleware, noopAuthMiddleware],
}))
