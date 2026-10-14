import { Button, ButtonLink } from "@/components/shared/ui/Button";
import type { Dictionary } from "@/i18n/get-dictionary";

/** Shown at checkout to signed-out visitors; the cart stays saved. Guests can order without an account. */
export default function SignInGate({
  href,
  dict,
  onGuest,
}: {
  href: string;
  dict: Dictionary["checkout"]["gate"];
  onGuest: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-3xl">{dict.title}</h1>
      <p className="mt-3 text-lg text-muted-foreground">{dict.text}</p>
      <div className="mx-auto mt-8 flex max-w-xs flex-col gap-3">
        <ButtonLink href={href} size="lg" block>
          {dict.signIn}
        </ButtonLink>
        <p className="text-xs text-muted-foreground">{dict.or}</p>
        <Button variant="secondary" size="lg" block onClick={onGuest}>
          {dict.guest}
        </Button>
        <p className="text-xs text-muted-foreground">{dict.guestNote}</p>
      </div>
    </div>
  );
}
