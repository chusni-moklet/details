import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";
import { ExternalLink, Award, Eye } from "lucide-react";
import { getTeachers } from "@/services/teachers";

export const metadata: Metadata = { title: "Kelola Guru" };

export default async function AdminTeachersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);

  const { teachers, total } = await getTeachers(
    { query: params.q, sort: "name" },
    page,
    20
  );

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">Kelola Guru</h1>
          <p className="text-gray-400 mt-1">{total} guru terdaftar</p>
        </div>
      </div>

      <div className="rounded-2xl border border-dark-700/50 bg-dark-800/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-700/50 bg-dark-900/50">
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Guru</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium hidden md:table-cell">Jurusan</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium hidden lg:table-cell">Mapel</th>
                <th className="text-center px-4 py-3 text-gray-400 font-medium">Sertifikasi</th>
                <th className="text-center px-4 py-3 text-gray-400 font-medium hidden sm:table-cell">Views</th>
                <th className="text-center px-4 py-3 text-gray-400 font-medium">Profil</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700/30">
              {teachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-dark-800/60 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg overflow-hidden border border-dark-600 flex-shrink-0">
                        {teacher.photo_url ? (
                          <Image
                            src={teacher.photo_url}
                            alt={teacher.full_name}
                            width={36}
                            height={36}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full bg-dark-700 flex items-center justify-center">
                            <span className="text-xs font-bold text-red-400">
                              {getInitials(teacher.full_name)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-white text-sm">{teacher.full_name}</p>
                        <p className="text-xs text-gray-500">{teacher.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {teacher.department ? (
                      <Badge variant="secondary" className="text-xs">
                        {teacher.department.icon} {teacher.department.name}
                      </Badge>
                    ) : (
                      <span className="text-gray-600 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-gray-300 text-xs">{teacher.subject ?? "—"}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="flex items-center justify-center gap-1 text-amber-400 text-xs">
                      <Award className="w-3.5 h-3.5" />
                      {teacher.certification_count}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center hidden sm:table-cell">
                    <span className="flex items-center justify-center gap-1 text-red-400 text-xs">
                      <Eye className="w-3.5 h-3.5" />
                      {teacher.view_count}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center">
                      <div className="w-16 h-1.5 bg-dark-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full"
                          style={{ width: `${teacher.completion_percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 ml-2">{teacher.completion_percentage}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Button asChild size="icon-sm" variant="ghost">
                      <Link href={`/teacher/${teacher.slug}`} target="_blank">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 20 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-dark-700/50">
            <p className="text-xs text-gray-500">
              Menampilkan {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} dari {total}
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <Button asChild size="sm" variant="outline">
                  <Link href={`/admin/teachers?page=${page - 1}`}>Sebelumnya</Link>
                </Button>
              )}
              {page * 20 < total && (
                <Button asChild size="sm" variant="outline">
                  <Link href={`/admin/teachers?page=${page + 1}`}>Berikutnya</Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
