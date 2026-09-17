import { analyzeAppraisal } from './src/server/appraisal';

async function main() {
  try {
    const res = await analyzeAppraisal({ imageBase64: 'data:image/jpeg;base64,' + Buffer.from(new Uint8Array([0xff, 0xd8, 0xff])).toString('base64') });
    console.log("Success! " + JSON.stringify(res).slice(0, 100));
  } catch(e) {
    console.error("Failed:", e);
  }
}
main();
