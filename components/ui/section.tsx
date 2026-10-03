import { cn } from "@/lib/utils";

type ContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  size?: "page" | "wide";
};

type SectionProps = React.HTMLAttributes<HTMLElement>;

export function Container({
  className,
  size = "page",
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-6",
        size === "page" ? "max-w-[1120px]" : "max-w-[1280px]",
        className,
      )}
      {...props}
    />
  );
}

export function Section({ className, ...props }: SectionProps) {
  return <section className={cn("py-16 sm:py-20", className)} {...props} />;
}
