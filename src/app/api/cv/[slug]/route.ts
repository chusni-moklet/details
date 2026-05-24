import { type NextRequest, NextResponse } from "next/server";
import { getTeacherBySlug } from "@/services/teachers";
import { formatDateShort } from "@/lib/utils";
import type { TeacherWithStats } from "@/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const teacher = await getTeacherBySlug(slug);

  if (!teacher) {
    return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
  }

  const html = generateCVHTML(teacher);

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `inline; filename="cv-${slug}.html"`,
    },
  });
}

function generateCVHTML(teacher: TeacherWithStats): string {
  const skills        = teacher.skills        ?? [];
  const certs         = teacher.certifications ?? [];
  const portfolios    = teacher.portfolios     ?? [];
  const achievements  = teacher.achievements   ?? [];

  const socialLinks = [
    teacher.linkedin && `<a href="${teacher.linkedin}">LinkedIn</a>`,
    teacher.github   && `<a href="${teacher.github}">GitHub</a>`,
    teacher.website  && `<a href="${teacher.website}">Website</a>`,
  ]
    .filter(Boolean)
    .join("");

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CV — ${teacher.full_name}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Segoe UI',Arial,sans-serif;color:#1e293b;background:#fff;font-size:14px}
    .page{max-width:800px;margin:0 auto;padding:40px}
    .header{display:flex;gap:24px;align-items:flex-start;margin-bottom:32px;padding-bottom:24px;border-bottom:3px solid #06b6d4}
    .photo{width:100px;height:100px;border-radius:12px;object-fit:cover;flex-shrink:0}
    .photo-placeholder{width:100px;height:100px;border-radius:12px;background:#0d1526;display:flex;align-items:center;justify-content:center;color:#06b6d4;font-size:32px;font-weight:700;flex-shrink:0}
    .name{font-size:26px;font-weight:700;color:#0d1526;line-height:1.2}
    .subtitle{font-size:15px;color:#06b6d4;margin-top:4px;font-weight:500}
    .meta{font-size:12px;color:#64748b;margin-top:6px}
    .motto{font-style:italic;color:#475569;margin-top:8px;font-size:13px;border-left:3px solid #06b6d4;padding-left:10px}
    .social{display:flex;gap:16px;flex-wrap:wrap;margin-top:10px}
    .social a{font-size:12px;color:#06b6d4;text-decoration:none}
    .section{margin-bottom:24px}
    .section-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#06b6d4;margin-bottom:10px;padding-bottom:5px;border-bottom:1px solid #e2e8f0}
    .bio{font-size:13px;line-height:1.7;color:#334155}
    .skill-grid{display:flex;flex-wrap:wrap;gap:6px}
    .skill{padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;background:#e0f2fe;color:#0369a1}
    .item{margin-bottom:10px;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;border-left:3px solid #06b6d4}
    .item-title{font-weight:600;font-size:13px;color:#0f172a}
    .item-meta{font-size:11px;color:#64748b;margin-top:3px}
    .verified{display:inline-block;padding:1px 7px;border-radius:10px;font-size:10px;background:#dcfce7;color:#166534;margin-left:6px;font-weight:600}
    .timeline{display:flex;gap:12px;margin-bottom:10px}
    .year{font-weight:700;color:#06b6d4;min-width:38px;font-size:12px;padding-top:1px}
    .timeline-content{font-size:13px;color:#334155}
    .timeline-title{font-weight:600}
    .footer{margin-top:40px;padding-top:12px;border-top:1px solid #e2e8f0;text-align:center;font-size:10px;color:#94a3b8}
    @media print{body{print-color-adjust:exact;-webkit-print-color-adjust:exact}}
  </style>
</head>
<body>
<div class="page">
  <div class="header">
    ${teacher.photo_url
      ? `<img src="${teacher.photo_url}" alt="${teacher.full_name}" class="photo"/>`
      : `<div class="photo-placeholder">${teacher.full_name.charAt(0).toUpperCase()}</div>`
    }
    <div style="flex:1">
      <div class="name">${teacher.full_name}</div>
      <div class="subtitle">${[teacher.subject, teacher.department?.name].filter(Boolean).join(" · ")}</div>
      <div class="meta">${teacher.experience ? `${teacher.experience} tahun pengalaman · ` : ""}SMK Telkom Malang</div>
      ${teacher.motto ? `<div class="motto">"${teacher.motto}"</div>` : ""}
      ${socialLinks ? `<div class="social">${socialLinks}</div>` : ""}
    </div>
  </div>

  ${teacher.bio ? `
  <div class="section">
    <div class="section-title">Tentang</div>
    <div class="bio">${teacher.bio}</div>
  </div>` : ""}

  ${skills.length > 0 ? `
  <div class="section">
    <div class="section-title">Skills &amp; Kompetensi</div>
    <div class="skill-grid">${skills.map((s) => `<span class="skill">${s.skill_name}</span>`).join("")}</div>
  </div>` : ""}

  ${certs.length > 0 ? `
  <div class="section">
    <div class="section-title">Sertifikasi (${certs.length})</div>
    ${certs.map((c) => `
    <div class="item">
      <div class="item-title">${c.title}${c.is_verified ? '<span class="verified">✓ Verified</span>' : ""}</div>
      <div class="item-meta">${c.issuer} · ${formatDateShort(c.issue_date)}${c.expired_date ? ` — ${formatDateShort(c.expired_date)}` : ""}</div>
    </div>`).join("")}
  </div>` : ""}

  ${achievements.length > 0 ? `
  <div class="section">
    <div class="section-title">Prestasi</div>
    ${[...achievements].sort((a, b) => b.year - a.year).map((a) => `
    <div class="timeline">
      <span class="year">${a.year}</span>
      <div class="timeline-content">
        <div class="timeline-title">${a.title}</div>
        ${a.description ? `<div>${a.description}</div>` : ""}
      </div>
    </div>`).join("")}
  </div>` : ""}

  ${portfolios.length > 0 ? `
  <div class="section">
    <div class="section-title">Portfolio (${portfolios.length})</div>
    ${portfolios.map((p) => `
    <div class="item">
      <div class="item-title">${p.title}</div>
      <div class="item-meta">${p.type} · ${p.description}</div>
    </div>`).join("")}
  </div>` : ""}

  <div class="footer">
    Generated by DETAILS — SMK Telkom Malang &nbsp;·&nbsp;
    ${process.env.NEXT_PUBLIC_APP_URL ?? "https://details.moklet.com"}/teacher/${teacher.slug}
  </div>
</div>
<script>window.onload=()=>window.print();</script>
</body>
</html>`;
}
