// @ts-nocheck
import { useMemo, useState, useRef, useCallback } from "react";

export function useHighlight() {
  // https://emilkowal.ski/ui/tabs
  const [tabBoundingBox, setTabBoundingBox] = useState(null);
  const [wrapperBoundingBox, setWrapperBoundingBox] = useState(null);
  const [highlightedTab, setHighlightedTab] = useState(null);
  const [isHoveredFromNull, setIsHoveredFromNull] = useState(true);

  const highlightRef = useRef(null);
  const wrapperRef = useRef(null);

  const reposition = useCallback(
    (ref, id) => {
      setTabBoundingBox(ref.current.getBoundingClientRect());
      if (wrapperRef.current) {
        // @ts-ignore
        setWrapperBoundingBox(wrapperRef.current.getBoundingClientRect());
      }
      setIsHoveredFromNull(!highlightedTab);
      setHighlightedTab(id);
    },
    [highlightedTab]
  );

  const reset = useCallback(() => setHighlightedTab(null), []);

  const styles = useMemo(() => {
    if (tabBoundingBox && wrapperBoundingBox) {
      return {
        transitionDuration: isHoveredFromNull ? "0ms" : "150ms",
        opacity: highlightedTab ? 1 : 0,
        // @ts-ignore
        height: `${tabBoundingBox.height}px`,
        transform: `translate(0, ${
          tabBoundingBox.top - wrapperBoundingBox.top
        }px)`,
      };
    } else {
      return {};
    }
  }, [tabBoundingBox, wrapperBoundingBox, highlightedTab, isHoveredFromNull]);

  return useMemo(
    () => ({
      highlightRef,
      wrapperRef,
      styles,
      reposition,
      reset,
    }),
    [highlightRef, wrapperRef, styles, reposition, reset]
  );
}
