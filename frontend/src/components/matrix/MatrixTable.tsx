import React, { useMemo } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    createColumnHelper
} from '@tanstack/react-table';
import { useNavigationStore } from '../../store/useMatrixStore';
import type { ServiceDefinition } from '../../types/schema';
import { ServiceCell } from './ServiceCell';

interface MatrixTableProps {
    services?: ServiceDefinition[];
    visibleColumns?: string[];
}

export const MatrixTable: React.FC<MatrixTableProps> = ({ services, visibleColumns }) => {
    const { config } = useNavigationStore();

    const columnHelper = createColumnHelper<ServiceDefinition>();

    // Use passed services or fallback to all services from config
    const data = useMemo(() => services || config.services, [services, config.services]);

    // Determine which columns to show
    const displayColumns = useMemo(() => {
        if (!config) return [];
        return visibleColumns
            ? config.columns.filter(c => visibleColumns.includes(c.id))
            : config.columns;
    }, [config, visibleColumns]);

    const columns = useMemo(() => {
        if (!config) return [];

        const serviceCol = columnHelper.accessor('name', {
            id: 'service_name',
            header: 'Service',
            cell: info => (
                <div className="flex flex-col">
                    <span className="font-semibold text-[var(--foreground)]">{info.getValue()}</span>
                    {info.row.original.description && (
                        <span className="text-xs text-[var(--foreground-muted)] truncate max-w-[200px]">{info.row.original.description}</span>
                    )}
                </div>
            ),
            size: 250,
            enablePinning: true,
        });

        const dynamicCols = displayColumns.map(col =>
            columnHelper.display({
                id: col.id,
                header: col.title,
                cell: (info) => <ServiceCell service={info.row.original} column={col} />
            })
        );

        return [serviceCol, ...dynamicCols];
    }, [config, displayColumns]);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    if (!config) return <div>Loading config...</div>;

    return (
        <div className="w-full overflow-hidden border border-[var(--border)] bg-[var(--surface)] rounded-2xl shadow-2xl backdrop-blur-xl">
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-[var(--background)] sticky top-0 z-10 backdrop-blur-md">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th
                                        key={header.id}
                                        className="p-4 border-b border-[var(--border)] text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider whitespace-nowrap first:pl-6"
                                        style={{ width: header.getSize() }}
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                        {table.getRowModel().rows.map(row => (
                            <tr key={row.id} className="hover:bg-[var(--surface-hover)] transition-colors group">
                                {row.getVisibleCells().map(cell => (
                                    <td
                                        key={cell.id}
                                        className="p-4 text-sm text-[var(--foreground-muted)] whitespace-nowrap first:pl-6 first:font-medium first:text-[var(--foreground)]"
                                    >
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
