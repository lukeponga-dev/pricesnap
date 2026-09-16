export const config = {
  runtime: "edge"
};

export default function handler(req: Request) {
  return new Response(
    JSON.stringify({
      status: "ok",
      service: "pricesnap-backend",
      timestamp: Date.now()
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
