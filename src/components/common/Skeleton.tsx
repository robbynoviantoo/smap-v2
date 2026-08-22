"use client";

import React from "react";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800 ${className}`}
    />
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="w-full border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900/40">
      {/* Header Skeleton */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800/60 flex items-center justify-between gap-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24 hidden sm:block" />
        <Skeleton className="h-4 w-24 hidden md:block" />
        <Skeleton className="h-4 w-28 hidden lg:block" />
        <Skeleton className="h-4 w-20" />
      </div>

      {/* Rows Skeleton */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 flex items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <Skeleton className="w-6 h-6 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-40 sm:w-56" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
          <Skeleton className="h-4 w-24 hidden sm:block" />
          <Skeleton className="h-4 w-20 hidden md:block" />
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-14 rounded-full hidden sm:block" />
          </div>
          <Skeleton className="h-7 w-20 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 space-y-3"
        >
          <Skeleton className="w-full h-36 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <div className="flex gap-2">
              <Skeleton className="w-14 h-7 rounded-lg" />
              <Skeleton className="w-14 h-7 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
