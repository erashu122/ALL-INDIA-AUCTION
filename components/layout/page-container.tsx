import { Container } from "@/components/ui";

type PageContainerProps = React.HTMLAttributes<HTMLDivElement>;

export function PageContainer({ children, ...props }: PageContainerProps) {
  return (
    <Container className="py-12 sm:py-16" {...props}>
      {children}
    </Container>
  );
}
