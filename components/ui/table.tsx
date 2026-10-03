import { cn } from "@/lib/utils";

type TableProps = React.TableHTMLAttributes<HTMLTableElement>;
type TableSectionProps = React.HTMLAttributes<HTMLTableSectionElement>;
type TableRowProps = React.HTMLAttributes<HTMLTableRowElement>;
type TableCellProps = React.TdHTMLAttributes<HTMLTableCellElement>;
type TableHeadProps = React.ThHTMLAttributes<HTMLTableCellElement>;

export function Table({ className, ...props }: TableProps) {
  return (
    <div className="w-full overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--color-border)]">
      <table className={cn("w-full border-collapse text-left text-sm", className)} {...props} />
    </div>
  );
}

export function TableHeader(props: TableSectionProps) {
  return <thead className="bg-[var(--color-surface-muted)]" {...props} />;
}

export function TableBody(props: TableSectionProps) {
  return <tbody className="divide-y divide-[var(--color-border)]" {...props} />;
}

export function TableRow({ className, ...props }: TableRowProps) {
  return <tr className={cn("bg-white", className)} {...props} />;
}

export function TableHead({ className, ...props }: TableHeadProps) {
  return (
    <th
      className={cn("px-4 py-3 font-medium text-[var(--color-text)]", className)}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: TableCellProps) {
  return (
    <td
      className={cn("px-4 py-3 text-[var(--color-text-muted)]", className)}
      {...props}
    />
  );
}
