import React, { useMemo } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    createColumnHelper
} from '@tanstack/react-table';
import { useMatrixStore } from '../../store/useMatrixStore';
import type { ServiceDefinition } from '../../types/schema';
import { ServiceCell } from './ServiceCell';

export const MatrixTable: React.FC = () => {
    const { config } = useMatrixStore();

    const columnHelper = createColumnHelper<ServiceDefinition>();

    const columns = useMemo(() => {
        if (!config) return [];

        const serviceCol = columnHelper.accessor('name', {
            id: 'service_name',
            header: 'Service',
            cell: info => (
                <div className="flex flex-col">
                    <span className="font-semibold text-slate-100">{info.getValue()}</span>
                    {info.row.original.description && (
                        <span className="text-xs text-slate-500 truncate max-w-[200px]">{info.row.original.description}</span>
                    )}
                </div>
            ),
            size: 250,
            enablePinning: true,
        });

        const dynamicCols = config.columns.map(col =>
            columnHelper.display({
                id: col.id,
                header: col.title,
                cell: (info) => <ServiceCell service={info.row.original} column={col} />
            })
        );

        return [serviceCol, ...dynamicCols];
    }, [config]);

    const table = useReactTable({
        data: config?.services || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    if (!config) return <div>Loading config...</div>;

    return (
        <div className="w-full overflow-hidden border border-white/5 bg-slate-900/40 rounded-2xl shadow-2xl backdrop-blur-xl">
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-white/5 sticky top-0 z-10 backdrop-blur-md">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th
                                        key={header.id}
                                        className="p-4 border-b border-white/5 text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap first:pl-6"
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
                    <tbody className="divide-y divide-white/5">
                        {table.getRowModel().rows.map(row => (
                            <tr key={row.id} className="hover:bg-white/5 transition-colors group">
                                {row.getVisibleCells().map(cell => (
                                    <td
                                        key={cell.id}
                                        className="p-4 text-sm text-slate-300 whitespace-nowrap first:pl-6 first:font-medium first:text-white"
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
