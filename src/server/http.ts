import { analyzeAppraisal, AppraisalError, appraisalErrorResponse } from './appraisal';

export async function handleAnalysisRequest(request: Request): Promise<Response> {
  const id = crypto.randomUUID(), started = Date.now();
  const headers = { 'Cache-Control': 'no-store', 'X-Request-ID': id };
  const failure = (error: unknown) => {
    const result = appraisalErrorResponse(error, id, started);
    return Response.json(result.body, { status: result.status, headers });
  };
  if (request.method !== 'POST') {
    const response = failure(new AppraisalError('Use POST /api/analyze.', 'METHOD_NOT_ALLOWED', 405));
    response.headers.set('Allow', 'POST');
    return response;
  }
  let body: unknown;
  try { body = await request.json(); }
  catch { return failure(new AppraisalError('Request body must contain valid JSON.', 'INVALID_JSON', 400)); }
  if (!request.headers.get('accept')?.includes('application/x-ndjson')) {
    try { return Response.json(await analyzeAppraisal(body, id), { headers }); }
    catch (error) { return failure(error); }
  }
  const encoder = new TextEncoder();
  let cancelled = false;
  const stream = new ReadableStream({
    async start(controller) {
      const send = (value: unknown) => { if (!cancelled) controller.enqueue(encoder.encode(JSON.stringify(value) + '\n')); };
      try {
        const result = await analyzeAppraisal(body, id, stage => send({ type: 'progress', stage }));
        send({ type: 'result', data: result });
      } catch (error) {
        send({ type: 'error', ...appraisalErrorResponse(error, id, started).body });
      } finally { if (!cancelled) controller.close(); }
    },
    cancel() { cancelled = true; },
  });
  return new Response(stream, { headers: { ...headers, 'Content-Type': 'application/x-ndjson; charset=utf-8', 'X-Accel-Buffering': 'no' } });
}
