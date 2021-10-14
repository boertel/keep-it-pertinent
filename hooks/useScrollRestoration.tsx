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
  const store = useRef<{ [key: string]: any }>({});
  const onLeave = useRef<any>();
  const onEnter = useRef<any>();
  const page = useRef<string | null>(null);

  const { pathname } = useRouter();

  useEffect(() => {
    if (onEnter.current && page.current === pathname) {
      onEnter.current(store.current);
    }
  }, [pathname]);

  const onRouteChangeStart = useCallback(() => {
    if (page.current === pathname && onLeave.current) {
      store.current = onLeave.current();
    }
  }, [pathname, onLeave]);

  useEffect(() => {
    Router.events.on("routeChangeStart", onRouteChangeStart);
    return () => Router.events.off("routeChangeStart", onRouteChangeStart);
  }, [onRouteChangeStart]);

  const enter = useCallback(
    (callback) => {
      page.current = pathname;
      onEnter.current = callback;
    },
    [pathname]
  );

  const leave = useCallback((callback) => {
    onLeave.current = callback;
  }, []);

  const context = useMemo(
    () => ({
      enter,
      leave,
    }),
    [enter, leave]
  );

  return <ScrollRestorationContext.Provider value={context} {...props} />;
}

export function useOnEnter<T>(callback: (arg0: T) => void) {
  const { enter } = useScrollRestoration();
  useEffect(() => {
    enter(callback);
  }, [enter, callback]);
}

export function useOnLeave<T>(callback: () => T) {
  const { leave } = useScrollRestoration();
  useEffect(() => {
    leave(callback);
  }, [leave, callback]);
}

export function useScrollRestoration(): any {
  return useContext(ScrollRestorationContext);
}
