import { NextResponse } from "next/server";
import { success, failure } from "@/lib/api-response";
import { releaseIp } from "@/modules/ipam/api/ip-handlers";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await releaseIp(id);
    return NextResponse.json(success(null));
  } catch (error) {
    return NextResponse.json(failure("IP 반납 실패"), { status: 500 });
  }
}
