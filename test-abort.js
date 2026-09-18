async function run() {
const controller = new AbortController();
controller.abort();
try {
  await fetch('http://example.com', { signal: controller.signal });
} catch (e) {
  console.log(e.name, e.code, e.status);
}
}
run();
