import { NextResponse } from "next/server";
import { success, failure } from "@/lib/api-response";
import { ipAddressSchema } from "@/modules/ipam/schemas";
import {
  getIpAddresses,
  createIpAddress,
} from "@/modules/ipam/api/ip-handlers";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const subnetId = searchParams.get("subnetId") || undefined;
    const ips = await getIpAddresses(subnetId);
    return NextResponse.json(success(ips));
  } catch (error) {
    return NextResponse.json(failure("IP 주소 조회 실패"), { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = ipAddressSchema.parse(body);
    const ip = await createIpAddress(parsed);
    return NextResponse.json(success(ip), { status: 201 });
  } catch (error) {
    return NextResponse.json(failure("IP 주소 생성 실패"), { status: 400 });
  }
}
