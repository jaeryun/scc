import { NextResponse } from "next/server";
import { success, failure } from "@/lib/api-response";
import { ipAddressSchema } from "@/features/ipam/schemas";
import {
  updateIpAddress,
  deleteIpAddress,
} from "@/features/ipam/api/ip-handlers";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = ipAddressSchema.parse(body);
    const ip = await updateIpAddress(id, parsed);
    return NextResponse.json(success(ip));
  } catch (error) {
    return NextResponse.json(failure("IP 주소 수정 실패"), { status: 400 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteIpAddress(id);
    return NextResponse.json(success(null));
  } catch (error) {
    return NextResponse.json(failure("IP 주소 삭제 실패"), { status: 500 });
  }
}
