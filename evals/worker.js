// tinyeval worker for the support bot. In evals/support.sh:
//   worker node evals/worker.js
// The bot and its client load once per worker, not once per test case.
import { worker, CouldntRun } from "tinyeval-cli"; // first, so the app's console.log goes to stderr
import { answer } from "../src/support.js";

// A missing key, a bad key, a rate limit, a server error, a timeout or the network: the helper replies
// couldn't run. Any other error, like a bad model name or a bug in the app's own code, is the reply, so the eval fails.
await worker(async (input) => {
  if (!process.env.ANTHROPIC_API_KEY) throw new CouldntRun("no ANTHROPIC_API_KEY"); // the SDK throws a plain Error for it
  return answer(input);
});
