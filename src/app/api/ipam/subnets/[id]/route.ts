import { NextResponse } from "next/server";
import { success, failure } from "@/lib/api-response";
import { subnetSchema } from "@/features/ipam/schemas";
import {
  updateSubnet,
  deleteSubnet,
} from "@/features/ipam/api/subnet-handlers";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = subnetSchema.parse(body);
    const subnet = await updateSubnet(id, parsed);
    return NextResponse.json(success(subnet));
  } catch (error) {
    return NextResponse.json(failure("서브넷 수정 실패"), { status: 400 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteSubnet(id);
    return NextResponse.json(success(null));
  } catch (error) {
    return NextResponse.json(failure("서브넷 삭제 실패"), { status: 500 });
  }
}
