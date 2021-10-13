import {
  useRef,
  useMemo,
  createContext,
  useContext,
  useEffect,
  useCallback,
} from "react";
import Router, { useRouter } from "next/router";

const ScrollRestorationContext = createContext({});

export function ScrollRestorationProvider(props: any) {
  const ref = useRef<number>(0);
  const store = useRef<{ [key: string]: any }>({});
  const onLeave = useRef<any>();
  const page = useRef<string | null>(null);

  const { pathname } = useRouter();

  const restore = useCallback(
    (callback) => {
      page.current = pathname;
      onLeave.current = callback;
      if (ref.current) {
        window.scrollTo(0, ref.current);
      }
    },
    [pathname, pathname]
  );

  const onRouteChangeStart = useCallback(() => {
    if (page.current === pathname && onLeave.current) {
      onLeave.current();
      //ref.current = window.scrollY;
    }
  }, [pathname, onLeave]);

  useEffect(() => {
    Router.events.on("routeChangeStart", onRouteChangeStart);
    return () => Router.events.off("routeChangeStart", onRouteChangeStart);
  }, [onRouteChangeStart]);

  const context = useMemo(
    () => ({
      restore,
    }),
    [restore]
  );

  return <ScrollRestorationContext.Provider value={context} {...props} />;
}

export function useScrollRestoration(): any {
  return useContext(ScrollRestorationContext);
}
