import { handleAnalysisRequest } from '../src/server/http';

// The default Node.js runtime supports Buffer and the Gemini SDK.
export default { fetch: handleAnalysisRequest };
