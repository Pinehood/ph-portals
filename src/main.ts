import { setupApp, setupSwagger, start } from "./setup";

(async function entrypoint() {
  const app = await setupApp();
  // await setupSwagger(app);
  await start(app);
})();
