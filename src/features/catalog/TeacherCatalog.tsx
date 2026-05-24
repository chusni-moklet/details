"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Users, SlidersHorizontal } from "lucide-react";
import { TeacherCard } from "@/components/teacher/TeacherCard";
import { SearchBar } from "@/components/shared/SearchBar";
import { FilterDropdown } from "@/components/shared/FilterDropdown";
import type { Department, TeacherFilters, TeacherWithStats } from "@/types";

interface TeacherCatalogProps {
  initialTeachers: TeacherWithStats[];
  total: number;
  departments: Department[];
  initialFilters: TeacherFilters;
}

export function TeacherCatalog({ initialTeachers, total, departments, initialFilters }: TeacherCatalogProps) {
  const router      = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [filters, setFilters] = useState<TeacherFilters>(initialFilters);

  const updateURL = (newFilters: TeacherFilters) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newFilters.query)                                    params.set("q", newFilters.query);
    else                                                     params.delete("q");
    if (newFilters.department_id && newFilters.department_id !== "all") params.set("department", newFilters.department_id);
    else                                                     params.delete("department");
    if (newFilters.sort)                                     params.set("sort", newFilters.sort);
    else                                                     params.delete("sort");
    startTransition(() => router.push(`/teachers?${params.toString()}`));
  };

  const handleSearch = (query: string) => {
    const f = { ...filters, query };
    setFilters(f);
    updateURL(f);
  };

  const handleDepartmentChange = (department_id: string) => {
    const f = { ...filters, department_id };
    setFilters(f);
    updateURL(f);
  };

  const handleSortChange = (sort: string) => {
    const f = { ...filters, sort: sort as "name" | "views" | "certifications" | "newest" };
    setFilters(f);
    updateURL(f);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-5 h-5 text-red-400" />
          <span className="text-sm text-red-400 font-medium">Profil Guru</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white font-display">
          Guru SMK Telkom Malang
        </h1>
        <p className="text-gray-400 mt-2">{total} guru profesional siap dieksplorasi</p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4 mb-8"
      >
        <SearchBar
          onSearch={handleSearch}
          defaultValue={filters.query ?? ""}
          placeholder="Cari nama, mapel, atau skill..."
          className="flex-1"
        />
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-gray-400" />
          <FilterDropdown
            departments={departments}
            selectedDepartment={filters.department_id ?? "all"}
            selectedSort={filters.sort ?? "name"}
            onDepartmentChange={handleDepartmentChange}
            onSortChange={handleSortChange}
          />
        </div>
      </motion.div>

      {/* Grid */}
      {initialTeachers.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
          <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400">Guru tidak ditemukan</h3>
          <p className="text-gray-500 text-sm mt-1">Coba ubah filter atau kata kunci pencarian</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {initialTeachers.map((teacher, index) => (
            <TeacherCard key={teacher.id} teacher={teacher} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
