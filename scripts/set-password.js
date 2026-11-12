import { randomBytes } from "node:crypto";
import readline from "node:readline";
import { hashPassword } from "../lib/auth.js";

const MIN_LENGTH = 14;

function askHidden(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl._writeToOutput = (text) => {
      if (text.includes(question)) process.stdout.write(question);
    };
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
  });
}

const password = await askHidden("New admin password: ");
if (password.length < MIN_LENGTH) {
  console.error(`Password must be at least ${MIN_LENGTH} characters. Use a long phrase.`);
  process.exit(1);
}
const confirm = await askHidden("Repeat password: ");
if (confirm !== password) {
  console.error("Passwords do not match.");
  process.exit(1);
}

console.log("\nAdd these to Vercel (Project Settings → Environment Variables) and to your local .env:\n");
console.log(`ADMIN_PASSWORD_HASH=${await hashPassword(password)}`);
console.log(`SESSION_SECRET=${randomBytes(32).toString("hex")}`);
