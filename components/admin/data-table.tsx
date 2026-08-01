'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Eye } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T extends { id: number | string }>({
  data,
  columns,
  onEdit,
  onDelete,
  onView,
  isLoading = false,
  emptyMessage = 'No data available',
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">{emptyMessage}</div>
      </div>
    );
  }

  const hasActions = onEdit || onDelete || onView;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column.key} className={column.className}>
              {column.header}
            </TableHead>
          ))}
          {hasActions && <TableHead className="w-[100px] text-right">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.id}>
            {columns.map((column) => (
              <TableCell key={column.key} className={column.className}>
                {column.render
                  ? column.render(item)
                  : (item[column.key as keyof T] as React.ReactNode)}
              </TableCell>
            ))}
            {hasActions && (
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  {onView && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onView(item)}
                      title="View"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(item)}
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(item)}
                      title="Delete"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// Helper function to render status badges
export function StatusBadge({ status }: { status: string }) {
  const statusColors: Record<string, string> = {
    ACTIVE: 'bg-green-500',
    INACTIVE: 'bg-gray-500',
    SUSPENDED: 'bg-red-500',
    DRAFT: 'bg-yellow-500',
    REVIEW: 'bg-blue-500',
    PUBLISHED: 'bg-green-500',
    ARCHIVED: 'bg-gray-500',
    PENDING: 'bg-yellow-500',
    APPROVED: 'bg-green-500',
    REJECTED: 'bg-red-500',
    DELETED: 'bg-gray-500',
  };

  return (
    <Badge
      variant="outline"
      className={`${statusColors[status] || 'bg-gray-500'} text-white border-0`}
    >
      {status}
    </Badge>
  );
}

// Helper function to render role badges
export function RoleBadge({ role }: { role: string }) {
  const roleColors: Record<string, string> = {
    ADMIN: 'bg-purple-500',
    EDITOR: 'bg-blue-500',
    AUTHOR: 'bg-green-500',
  };

  return (
    <Badge
      variant="outline"
      className={`${roleColors[role] || 'bg-gray-500'} text-white border-0`}
    >
      {role}
    </Badge>
  );
}

