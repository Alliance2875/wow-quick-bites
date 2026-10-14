import Icon from "@/components/shared/ui/Icon";

/** Error line under the sign-in / sign-up fields (announced by screen readers). */
export default function AuthError({ message }: { message: string }) {
  return (
    <p role="alert" className="flex items-start gap-2 rounded-xl bg-critical/10 px-3 py-2.5 text-sm text-critical">
      <Icon name="info" className="mt-0.5 h-4 w-4 shrink-0" />
      {message}
    </p>
  );
}
