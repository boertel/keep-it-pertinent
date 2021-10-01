import {
  useState,
  createContext,
  useContext,
  useCallback,
  useMemo,
  useDispatch,
  useRedycer,
} from "react";
import cn from "classnames";
import { useEventListener } from "@/hooks";

const ShowShortcutContext = createContext({});

function reducer(state, action) {
  switch (action.type) {
    case "REGISTER":
      return {
        ...state,
        [action.key]: action.callback,
      };
  }
}

export function useShortcut(combinaison: string, callback: () => void) {}

export function ShowShortcutProvider(props: any) {
  const [show, setShow] = useState<boolean>(false);

  const onKeyDown = useCallback(
    (evt) => {
      setShow(evt.shiftKey);
    },
    [setShow]
  );

  const onKeyUp = (evt) => {
    if (evt.key === "Shift") {
      setShow(false);
    }
  };

  useEventListener("keydown", onKeyDown);
  useEventListener("keyup", onKeyUp);

  const context = useMemo(
    () => ({
      show,
      setShow,
    }),
    [show, setShow]
  );

  return <ShowShortcutContext.Provider value={context} {...props} />;
}

export function useShowShortcut() {
  return useContext(ShowShortcutContext);
}

export function NotShortcut({ className, ...props }) {
  const { show } = useShowShortcut();
  return (
    <span
      className={cn(className, "transition-opacity", { "opacity-20": show })}
      {...props}
    />
  );
}

export function Shortcut({ className, ...props }) {
  const { show } = useShowShortcut();
  return (
    <span
      className={cn(className, "opacity-0 transition-opacity", {
        "opacity-100": show,
      })}
      {...props}
    />
  );
}
