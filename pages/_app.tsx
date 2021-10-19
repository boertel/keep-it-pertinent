import "../styles/global.css";
import { NextSeo } from "next-seo";
import cn from "classnames";
import { SWRConfig } from "swr";
import Link from "next/link";
import { useRouter } from "next/router";
import type { AppProps } from "next/app";
import { ShortcutProvider, useShortcutIsActive } from "@/hooks/useShortcut";
import { ScrollRestorationProvider } from "@/hooks/useScrollRestoration";
import { FollowersProvider } from "../components/Followers";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        fetcher: (resource, init) =>
          fetch(resource, init).then((res) => {
            if (res.ok) {
              return res.json();
            } else if (res.status === 401) {
              router.push(`/auth/login?next=${router.asPath}`);
            }
          }),
      }}
    >
      <NextSeo title="Keep it pertinent" />
      <FollowersProvider>
        <ScrollRestorationProvider>
          <ShortcutProvider>
            <header className="sticky top-0 max-w-prose mx-auto relative">
              <div className="absolute top-0 right-full py-6 px-4 mt-[22px]">
                <Link href="/">
                  <a className="no-underline">
                    <Logo />
                  </a>
                </Link>
              </div>
            </header>
            <main className="dark:bg-black min-h-screen flex flex-col">
              <Component {...pageProps} />
            </main>
          </ShortcutProvider>
        </ScrollRestorationProvider>
      </FollowersProvider>
    </SWRConfig>
  );
}

function Logo() {
  const isActive = useShortcutIsActive("Escape");
  return (
    <div className="text-4xl hover:animate-pulse flex flex-col justify-center items-center">
      <div>🗑</div>
      <kbd
        className={cn(
          "mt-2 text-xs font-thin transition-opacity opacity-0 py-1 px-2 border rounded-md border-gray-700",
          {
            "opacity-100": isActive,
          }
        )}
      >
        esc
      </kbd>
    </div>
  );
}
