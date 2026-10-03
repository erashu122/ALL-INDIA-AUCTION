type ApplicationShellProps = {
  children: React.ReactNode;
};

export function ApplicationShell({ children }: ApplicationShellProps) {
  return <div className="min-h-screen bg-white text-neutral-950">{children}</div>;
}
