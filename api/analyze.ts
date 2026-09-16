import { analyzeAppraisal, appraisalErrorResponse } from "../src/server/appraisal";

export const config = {
  runtime: "edge"
};

export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ ok: false, error: "METHOD_NOT_ALLOWED", message: "Use POST /api/analyze." }),
      {
        status: 405,
        headers: {
          "Content-Type": "application/json",
          "Allow": "POST"
        }
      }
    );
  }

  try {
    const body = await req.json();
    const result = await analyzeAppraisal(body);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    const failure = appraisalErrorResponse(error);
    return new Response(JSON.stringify(failure.body), {
      status: failure.status,
      headers: { "Content-Type": "application/json" }
    });
  }
}
