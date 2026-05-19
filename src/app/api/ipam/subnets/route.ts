import { NextResponse } from "next/server";
import { success, failure } from "@/lib/api-response";
import { subnetSchema } from "@/modules/ipam/schemas";
import {
  getSubnets,
  createSubnet,
} from "@/modules/ipam/api/subnet-handlers";

export async function GET() {
  try {
    const subnets = await getSubnets();
    return NextResponse.json(success(subnets));
  } catch (error) {
    return NextResponse.json(failure("서브넷 조회 실패"), { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = subnetSchema.parse(body);
    const subnet = await createSubnet(parsed);
    return NextResponse.json(success(subnet), { status: 201 });
  } catch (error) {
    return NextResponse.json(failure("서브넷 생성 실패"), { status: 400 });
  }
}
