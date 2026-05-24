"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Department } from "@/types";

interface FilterDropdownProps {
  departments: Department[];
  selectedDepartment: string;
  selectedSort: string;
  onDepartmentChange: (value: string) => void;
  onSortChange: (value: string) => void;
}

export function FilterDropdown({
  departments,
  selectedDepartment,
  selectedSort,
  onDepartmentChange,
  onSortChange,
}: FilterDropdownProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <Select value={selectedDepartment} onValueChange={onDepartmentChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Semua Kompetensi" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Kompetensi</SelectItem>
          {departments.map((dept) => (
            <SelectItem key={dept.id} value={dept.id}>
              {dept.icon} {dept.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedSort} onValueChange={onSortChange}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Urutkan" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="name">Nama A-Z</SelectItem>
          <SelectItem value="newest">Terbaru</SelectItem>
          <SelectItem value="certifications">Sertifikasi</SelectItem>
          <SelectItem value="views">Paling Dilihat</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
