import { NextResponse } from 'next/server';
import { success, failure } from '@/lib/api-response';
import { ipAddressSchema } from '@/modules/ipam/schemas';
import { updateIpAddress, deleteIpAddress } from '@/modules/ipam/api/ip-handlers';
import { ZodError } from 'zod';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = ipAddressSchema.parse(body);
    const ip = await updateIpAddress(id, parsed);
    return NextResponse.json(success(ip));
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(failure('입력값이 올바르지 않습니다'), { status: 400 });
    }
    return NextResponse.json(failure('서버 오류가 발생했습니다'), { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deleteIpAddress(id);
    return NextResponse.json(success(null));
  } catch (error) {
    return NextResponse.json(failure('IP 주소 삭제 실패'), { status: 500 });
  }
}
