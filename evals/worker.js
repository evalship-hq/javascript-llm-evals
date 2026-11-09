// tinyeval worker for the support bot. In evals/support.sh:
//   worker node evals/worker.js
// It reads each input up to a NUL byte and prints the reply and a NUL byte,
// so the app and its client load once per worker, not once per test case.
import Anthropic from "@anthropic-ai/sdk";

// stdout carries the replies, so console logs go to stderr. The import comes after, so the app's own logs do too.
console.log = console.info = console.debug = console.error;
const { answer } = await import("../src/support.js");

// When the cause isn't the app (no key, a bad key, a rate limit, a server error, a timeout
// or the network), tinyeval counts the test case as couldn't run. Any other API error,
// like a bad model name, is the reply, so the eval fails.
function failure(error) {
  if (error instanceof Anthropic.APIConnectionError) {
    return `#tinyeval couldnt_run ${error.name}: ${error.message}\n`;
  }
  if (error instanceof Anthropic.APIError) {
    const reason = `anthropic: ${error.status} ${error.type}`;
    const couldntRun = error.status === 401 || error.status === 429 || error.status >= 500;
    return couldntRun ? `#tinyeval couldnt_run ${reason}\n` : reason;
  }
  return `#tinyeval couldnt_run ${error.message.split("\n")[0]}\n`; // a missing key fails before any request
}

let rest = Buffer.alloc(0);
for await (const chunk of process.stdin) {
  rest = Buffer.concat([rest, chunk]);
  let i;
  while ((i = rest.indexOf(0)) >= 0) {
    const input = rest.subarray(0, i).toString();
    rest = rest.subarray(i + 1);
    const reply = await answer(input).catch(failure);
    process.stdout.write(reply + "\0");
  }
}
