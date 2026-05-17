import { NextResponse } from "next/server";
import { success, failure } from "@/lib/api-response";
import { assignIpFromSubnet } from "@/features/ipam/api/ip-handlers";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { subnetId, hostname, description } = body;

    if (!subnetId) {
      return NextResponse.json(failure("subnetId는 필수입니다"), { status: 400 });
    }

    const ip = await assignIpFromSubnet(subnetId, hostname, description);
    return NextResponse.json(success(ip), { status: 201 });
  } catch (error) {
    return NextResponse.json(
      failure(error instanceof Error ? error.message : "IP 할당 실패"),
      { status: 400 }
    );
  }
}
