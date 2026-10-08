import { ButtonLink } from "@/components/shared/ui/Button";
import type { Dictionary } from "@/i18n/get-dictionary";

/** Shown at checkout to signed-out visitors; the cart stays saved. */
export default function SignInGate({ href, dict }: { href: string; dict: Dictionary["checkout"]["gate"] }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-3xl">{dict.title}</h1>
      <p className="mt-3 text-lg text-muted-foreground">{dict.text}</p>
      <ButtonLink href={href} size="lg" className="mt-8">
        {dict.signIn}
      </ButtonLink>
    </div>
  );
}
