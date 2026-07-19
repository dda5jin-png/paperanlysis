/**
 * 자료실/블로그 중복 글 정리 스크립트
 * - 동일(정규화) 제목의 published 글 중 최신 1개만 남기고 나머지는 content_status='archived' 처리
 * - 삭제가 아닌 archived 처리라서 언제든 복구 가능
 *
 * 실행: node scripts/cleanup-duplicate-archive.mjs          (미리보기 dry-run)
 *       node scripts/cleanup-duplicate-archive.mjs --apply  (실제 반영)
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

// .env.local 로드 (dotenv 없이 직접 파싱)
try {
  const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  for (const line of env.split("\n")) {
    const match = line.match(/^([A-Z_]+)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].trim();
  }
} catch {
  // .env.local이 없으면 기존 환경변수 사용
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY가 필요합니다.");
  process.exit(1);
}

const apply = process.argv.includes("--apply");
const supabase = createClient(url, key);

function normalizeTitle(title) {
  return (title || "").toLowerCase().replace(/\s+/g, " ").trim();
}

const { data, error } = await supabase
  .from("archive_contents")
  .select("id,title,slug,content_status,published_at,created_at")
  .eq("content_status", "published")
  .order("published_at", { ascending: false });

if (error) {
  console.error("조회 실패:", error.message);
  process.exit(1);
}

const seen = new Map();
const toArchive = [];

for (const row of data) {
  const key = normalizeTitle(row.title);
  if (seen.has(key)) {
    toArchive.push(row);
  } else {
    seen.set(key, row);
  }
}

console.log(`published 글 ${data.length}개 중 유지 ${seen.size}개 / 중복 ${toArchive.length}개`);
for (const row of toArchive) {
  console.log(`  [중복] ${row.title} (${(row.published_at || row.created_at).slice(0, 10)}) → archived 예정`);
}

if (!apply) {
  console.log("\n미리보기 모드입니다. 실제 반영하려면: node scripts/cleanup-duplicate-archive.mjs --apply");
  process.exit(0);
}

let done = 0;
for (const row of toArchive) {
  const { error: updateError } = await supabase
    .from("archive_contents")
    .update({ content_status: "archived", updated_at: new Date().toISOString() })
    .eq("id", row.id);
  if (updateError) {
    console.error(`  실패: ${row.title} — ${updateError.message}`);
  } else {
    done += 1;
  }
}

console.log(`\n완료: ${done}개 글을 archived 처리했습니다. (복구: content_status를 published로 변경)`);
