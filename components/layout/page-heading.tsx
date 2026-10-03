type PageHeadingProps = {
  title: string;
  description?: string;
};

export function PageHeading({ title, description }: PageHeadingProps) {
  return (
    <header className="max-w-3xl">
      <h1 className="text-3xl font-semibold text-[var(--color-text)] sm:text-4xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-4 text-base leading-7 text-[var(--color-text-muted)]">
          {description}
        </p>
      ) : null}
    </header>
  );
}
