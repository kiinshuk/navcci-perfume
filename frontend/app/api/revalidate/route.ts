import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

export async function POST(req: Request) {
  const auth = req.headers.get("x-revalidate-secret");
  if (auth !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  if (body.path) revalidatePath(body.path);
  if (body.tag) revalidateTag(body.tag);
  return NextResponse.json({ ok: true, revalidated: true });
}
