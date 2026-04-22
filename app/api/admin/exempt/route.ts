import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const { error: authError, adminClient } = await requireAdmin();
  if (authError) return authError;

  // 2. 파라미터 추출
  const { 
    targetEmail, 
    isExempt, 
    isFreeWhitelist, 
    freeDailyLimit, 
    credits, 
    isActive 
  } = await req.json();

  if (!targetEmail) {
    return NextResponse.json({ error: "Target email is required" }, { status: 400 });
  }

  // 업데이트할 객체 동적 생성
  const updateData: any = {};
  if (isExempt !== undefined) updateData.is_exempt = isExempt;
  if (isFreeWhitelist !== undefined) updateData.is_free_whitelist = isFreeWhitelist;
  if (freeDailyLimit !== undefined) updateData.free_daily_limit = freeDailyLimit;
  if (credits !== undefined) updateData.credits = credits;
  if (isActive !== undefined) updateData.is_active = isActive;

  // 3. 사용자 프로필 업데이트
  const { error } = await adminClient
    .from("profiles")
    .update(updateData)
    .eq("email", targetEmail);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, updatedFields: Object.keys(updateData) });
}
