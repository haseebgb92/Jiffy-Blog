export const runtime = "nodejs";

export async function POST(req: Request) {
  const raw = await req.text();
  return new Response("ok", { status: 200 });
}


