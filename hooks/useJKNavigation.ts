import { useCallback, useState } from "react";
import { useRegisterShortcut } from "./useShortcut";

export default function useJKNavigation(max?: number) {
  const [navIndex, setNavIndex] = useState<number>(-1);

  useRegisterShortcut(
    "j",
    () => {
      setNavIndex((prev) => {
        if (max) {
          return prev >= max - 1 ? prev : prev + 1;
        } else {
          return prev + 1;
        }
      });
    },
    [setNavIndex, max]
  );

  useRegisterShortcut(
    "k",
    () => {
      setNavIndex((prev) => {
        return prev <= 0 ? 0 : prev - 1;
      });
    },
    [setNavIndex]
  );

  const focus = useCallback((node: HTMLElement) => {
    if (node) {
      node.focus();
      //node.scrollIntoView();
    }
  }, []);

  return [navIndex, setNavIndex, focus];
}
