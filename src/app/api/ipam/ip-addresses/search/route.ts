import { NextResponse } from "next/server";
import { success, failure } from "@/lib/api-response";
import { searchIpByHostname } from "@/features/ipam/api/ip-handlers";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const hostname = searchParams.get("hostname");

    if (!hostname) {
      return NextResponse.json(failure("hostname은 필수입니다"), { status: 400 });
    }

    const ips = await searchIpByHostname(hostname);
    return NextResponse.json(success(ips));
  } catch (error) {
    return NextResponse.json(failure("IP 검색 실패"), { status: 500 });
  }
}
