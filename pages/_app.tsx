import "../styles/global.css";
import { NextSeo } from "next-seo";
import { SWRConfig } from "swr";
import Link from "next/link";
import { useRouter } from "next/router";
import type { AppProps } from "next/app";
import { ShortcutProvider, useShortcutIsActive } from "@/hooks/useShortcut";
import { ScrollRestorationProvider } from "@/hooks/useScrollRestoration";
import { FollowersProvider } from "../components/Followers";
import { Keyboard, Favicon, Logo } from "@/components";
import { ListsProvider } from "../hooks/useLists";

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
      <Favicon />
      <NextSeo title="Keep it pertinent" />
      <FollowersProvider>
        <ListsProvider>
          <ScrollRestorationProvider>
            <ShortcutProvider>
              <header className="sticky top-0 max-w-prose mx-auto relative">
                <div className="absolute top-0 right-full py-6 px-4 mt-[12px]">
                  <Link href="/">
                    <a className="no-underline">
                      <LogoOnEscape />
                    </a>
                  </Link>
                </div>
              </header>
              <main className="dark:bg-black min-h-screen flex flex-col">
                <Component {...pageProps} />
              </main>
            </ShortcutProvider>
          </ScrollRestorationProvider>
        </ListsProvider>
      </FollowersProvider>
    </SWRConfig>
  );
}

function LogoOnEscape() {
  const isActive = useShortcutIsActive("Escape");
  return (
    <div className="text-6xl flex flex-col justify-center items-center">
      <div className="mb-2">
        <Logo
          className="filter grayscale hover:grayscale-0"
          style={{ transition: "filter .2s ease-in-out" }}
        />
      </div>
      <Keyboard className={isActive ? "opacity-100" : "opacity-0"}>
        esc
      </Keyboard>
    </div>
  );
}
