import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Suspense } from "react";

export default function Contact() {
  return (
    <div>
          <SiteHeader current="/about" />
              <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 md:py-14">
                {/* Suspense is required by Next.js when a page reads the URL query (useSearchParams) */}
                <Suspense fallback={null}>
                  This is the CONTACT PAGE
                </Suspense>
              </main>
          <SiteFooter />
        </div>
  );
}
