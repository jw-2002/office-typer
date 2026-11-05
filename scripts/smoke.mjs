// A quick end-to-end check in a real browser: start a game, finish an assignment, buy an upgrade, back up a save and meet an office event. Run with `npm run smoke`.
import { spawn } from "node:child_process";
import { chromium } from "playwright";

const PORT = 5198;
const url = `http://localhost:${PORT}/`;

const server = spawn("npx", ["vite", "--port", String(PORT), "--strictPort"], { shell: true, stdio: "ignore" });
const stopServer = () =>
  spawn("taskkill", ["/pid", String(server.pid), "/t", "/f"], { stdio: "ignore" }).on("error", () => server.kill());

const failures = [];
const check = (name, ok) => {
  console.log(`${ok ? "PASS" : "FAIL"} ${name}`);
  if (!ok) failures.push(name);
};

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      // Not up yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("The dev server did not start.");
}

try {
  await waitForServer();
  const browser = await chromium.launch({ args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader"] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(url);

  // A new game asks for a name.
  await page.getByLabel("Your name").fill("Smoke Tester");
  await page.getByRole("button", { name: "Start work" }).click();
  const text = page.getByLabel("Assignment text");
  await text.waitFor();
  check("the first-assignment hint shows", await page.getByText("Backspace fixes mistakes").isVisible());

  // Type the whole assignment.
  const target = (await text.innerText()).replace(/\s+/g, " ");
  await page.keyboard.type(target, { delay: 5 });
  check("finishing an assignment pays out", await page.getByText(/Assignment complete/).isVisible());

  // Money for the next steps, then a purchase.
  await page.evaluate(() => window.officeTyper.give(1000));
  await page.getByRole("button", { name: "Shop" }).click();
  const buy = page.getByRole("button", { name: "Buy", exact: true }).first();
  await buy.click();
  check("buying an upgrade works", (await page.getByRole("button", { name: /Use|Put away|Play/ }).count()) > 0);

  // Back up the save and load it again.
  await page.getByRole("button", { name: "Settings" }).click();
  await page.getByRole("button", { name: "Copy save" }).click();
  const code = await page.getByLabel("Save code").inputValue();
  check("a save code is made", code.startsWith("OT1:"));
  await page.getByRole("button", { name: "Load save" }).click();
  check("the save code loads", await page.getByText("Save loaded.").isVisible());

  // An office event interrupts, and a free choice closes it.
  await page.evaluate(() => window.officeTyper.event());
  const dialog = page.getByRole("alertdialog");
  await dialog.waitFor({ timeout: 10000 });
  await dialog
    .getByRole("button", { name: /^(?!.*[$��]).*$/ })
    .first()
    .click();
  await dialog.getByRole("button", { name: "Back to work" }).click();
  check("an office event can be answered", !(await dialog.isVisible()));

  check("no page errors", errors.length === 0);
  if (errors.length > 0) console.log(errors.join("\n"));
  await browser.close();
} catch (error) {
  console.error(error);
  failures.push("crashed");
} finally {
  stopServer();
}

process.exit(failures.length === 0 ? 0 : 1);
