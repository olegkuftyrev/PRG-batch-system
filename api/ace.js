/*
| JavaScript entrypoint for running ace commands.
| Registers ts-node for TypeScript and imports bin/console.ts
*/
import 'ts-node-maintained/register/esm'
await import('./bin/console.js')
