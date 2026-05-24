import type { Metadata } from "next";
import { AnalyticsCard } from "@/components/shared/AnalyticsCard";
import { getAnalytics, getHallOfFame } from "@/services/teachers";

export const metadata: Metadata = { title: "Analytics" };

export default async function AdminAnalyticsPage() {
  const [analytics, hallOfFame] = await Promise.all([
    getAnalytics(),
    getHallOfFame(5),
  ]);

  const avgCertsPerTeacher =
    analytics.total_teachers > 0
      ? (analytics.total_certifications / analytics.total_teachers).toFixed(1)
      : "0";

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white font-display">Analytics</h1>
        <p className="text-gray-400 mt-1">Statistik dan insight sistem DETAILS</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsCard title="Total Guru"          value={analytics.total_teachers}       iconName="Users"      color="red"    index={0} />
        <AnalyticsCard title="Total Sertifikasi"   value={analytics.total_certifications}  iconName="Award"      color="yellow" index={1} />
        <AnalyticsCard title="Total Profile Views" value={analytics.total_views}           iconName="Eye"        color="green"  index={2} />
        <AnalyticsCard
          title="Rata-rata Sertifikasi"
          value={avgCertsPerTeacher}
          subtitle="per guru"
          iconName="TrendingUp"
          color="blue"
          index={3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department breakdown */}
        <div className="rounded-2xl border border-dark-700/50 bg-dark-800/60 p-6 space-y-4">
          <h2 className="font-semibold text-white">Distribusi Guru per Jurusan</h2>
          {analytics.departments.length === 0 ? (
            <p className="text-sm text-gray-500">Belum ada data jurusan</p>
          ) : (
            <div className="space-y-3">
              {analytics.departments
                .sort((a, b) => b.count - a.count)
                .map((dept) => (
                  <div key={dept.name} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300 truncate">{dept.name}</span>
                      <span className="text-gray-400 ml-2 flex-shrink-0">{dept.count} guru</span>
                    </div>
                    <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-700 to-red-500 rounded-full transition-all duration-700"
                        style={{
                          width: `${analytics.total_teachers > 0
                            ? (dept.count / analytics.total_teachers) * 100
                            : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Top performers */}
        <div className="rounded-2xl border border-dark-700/50 bg-dark-800/60 p-6 space-y-4">
          <h2 className="font-semibold text-white">Top Performers</h2>
          <div className="space-y-3">
            {hallOfFame.map((entry) => (
              <div key={entry.teacher.id} className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-500 w-5">#{entry.rank}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{entry.teacher.full_name}</p>
                  <p className="text-xs text-gray-500">
                    {entry.teacher.certification_count} sertifikasi · {entry.teacher.view_count} views
                  </p>
                </div>
                <span className="text-xs font-bold text-red-400 flex-shrink-0">
                  {Math.round(entry.score)} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
