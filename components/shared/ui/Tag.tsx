export default function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-tag px-2 py-0.5 text-[0.625rem] font-medium text-tag-foreground">
      {children}
    </span>
  );
}
