"use client";

import Link from "next/link";
import { ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "./StatusBadge";
import type { SKIIndicator } from "../types";

interface SKITableProps {
  indicators: SKIIndicator[];
  canDelete?: boolean;
  onDelete?: (id: string) => void;
  showAssignee?: boolean;
}

export function SKITable({ indicators, canDelete, onDelete, showAssignee }: SKITableProps) {
  if (indicators.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 text-sm">
        Belum ada indikator SKI
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-dark-700/50">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-dark-700/50 bg-dark-900/50">
            <th className="text-left px-4 py-3 text-gray-400 font-medium">No</th>
            <th className="text-left px-4 py-3 text-gray-400 font-medium">SKU</th>
            <th className="text-left px-4 py-3 text-gray-400 font-medium">Indikator</th>
            <th className="text-left px-4 py-3 text-gray-400 font-medium hidden md:table-cell">Program</th>
            <th className="text-center px-4 py-3 text-gray-400 font-medium hidden lg:table-cell">Target</th>
            <th className="text-center px-4 py-3 text-gray-400 font-medium">Progress</th>
            <th className="text-center px-4 py-3 text-gray-400 font-medium">Status</th>
            {showAssignee && <th className="text-left px-4 py-3 text-gray-400 font-medium hidden md:table-cell">Ditugaskan ke</th>}
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-dark-700/30">
          {indicators.map((ind, index) => (
            <tr key={ind.id} className="hover:bg-dark-800/60 transition-colors group">
              <td className="px-4 py-3 text-gray-500 text-xs">{index + 1}</td>
              <td className="px-4 py-3">
                <div>
                  <p className="text-xs text-gray-300">{ind.sku ?? "—"}</p>
                  {ind.weight_sku > 0 && (
                    <p className="text-xs text-gray-500">Bobot: {ind.weight_sku}%</p>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <div>
                  <p className="font-medium text-white text-sm">{ind.title}</p>
                  {ind.category && (
                    <p className="text-xs text-gray-500">{ind.category.name}</p>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 hidden md:table-cell">
                <div>
                  <p className="text-xs text-gray-300">{ind.program ?? "—"}</p>
                  {ind.weight_program > 0 && (
                    <p className="text-xs text-gray-500">Bobot: {ind.weight_program}%</p>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-center hidden lg:table-cell">
                <div className="text-xs text-gray-400 space-y-0.5">
                  {ind.target_time_value && (
                    <p>{ind.target_time_value} {ind.target_time_unit}</p>
                  )}
                  {ind.target_output_value && (
                    <p>{ind.target_output_value} {ind.target_output_unit}</p>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2 min-w-[80px]">
                  <Progress value={ind.progress_percentage ?? 0} className="h-1.5 flex-1" />
                  <span className="text-xs text-gray-400 w-8 text-right">
                    {ind.progress_percentage ?? 0}%
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 text-center">
                <StatusBadge status={ind.status} size="sm" />
              </td>
              {showAssignee && (
                <td className="px-4 py-3 hidden md:table-cell">
                  <p className="text-xs text-gray-400">
                    {ind.assignee?.email ?? "—"}
                  </p>
                </td>
              )}
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  <Button asChild size="icon-sm" variant="ghost">
                    <Link href={`/dashboard/ski/${ind.id}`}>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </Button>
                  {canDelete && onDelete && (
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => onDelete(ind.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
