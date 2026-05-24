import type { Metadata } from "next";
import { AnalyticsCard } from "@/components/shared/AnalyticsCard";
import { getAnalytics, getTeachers } from "@/services/teachers";
import { TeacherCard } from "@/components/teacher/TeacherCard";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default async function AdminPage() {
  const [analytics, { teachers: topTeachers }] = await Promise.all([
    getAnalytics(),
    getTeachers({ sort: "certifications" }, 1, 6),
  ]);

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white font-display">Admin Dashboard</h1>
        <p className="text-gray-400 mt-1">Overview sistem DETAILS</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsCard title="Total Guru"          value={analytics.total_teachers}      iconName="Users"      color="red"    index={0} />
        <AnalyticsCard title="Total Sertifikasi"   value={analytics.total_certifications} iconName="Award"      color="yellow" index={1} />
        <AnalyticsCard title="Total Views"         value={analytics.total_views}          iconName="Eye"        color="green"  index={2} />
        <AnalyticsCard title="Jurusan Aktif"       value={analytics.departments.length}   iconName="BarChart3"  color="blue"   index={3} />
      </div>

      {/* Department breakdown */}
      <div className="rounded-2xl border border-dark-700/50 bg-dark-800/60 p-6">
        <h2 className="font-semibold text-white mb-4">Guru per Jurusan</h2>
        <div className="space-y-3">
          {analytics.departments.map((dept) => (
            <div key={dept.name} className="flex items-center gap-3">
              <span className="text-sm text-gray-300 w-48 truncate">{dept.name}</span>
              <div className="flex-1 h-2 bg-dark-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full transition-all duration-500"
                  style={{
                    width: `${analytics.total_teachers > 0 ? (dept.count / analytics.total_teachers) * 100 : 0}%`,
                  }}
                />
              </div>
              <span className="text-sm text-gray-400 w-8 text-right">{dept.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top teachers */}
      <div>
        <h2 className="font-semibold text-white mb-4">Guru Terbaik</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topTeachers.map((teacher, index) => (
            <TeacherCard key={teacher.id} teacher={teacher} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
