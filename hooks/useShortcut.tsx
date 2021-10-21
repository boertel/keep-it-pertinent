// @ts-nocheck
import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useContext,
  createContext,
} from "react";

const ShortcutContext = createContext({});

function registry(state, action) {
  switch (action.type) {
    case "REGISTER":
      return {
        ...state,
        [action.combination]: {
          ...(state[action.combination] || {}),
          [action.callback]: action.callback,
        },
      };
    case "UNREGISTER":
      const previous = {
        ...state[action.combination]?.registry,
      };
      delete previous[action.callback];
      return {
        ...state,
        [action.combination]: previous,
      };
  }
}
const initialHintState = {};
function hint(state, action) {
  switch (action.type) {
    case "SET":
      return {
        ...state,
        ...action.combinations,
      };
    case "RESET":
      return initialHintState;
  }
}

const specials = new Map();
specials.set("meta", (evt) => evt.metaKey);
specials.set("alt", (evt) => evt.altKey);
specials.set("control", (evt) => evt.ctrlKey);
specials.set("shift", (evt) => evt.shiftKey);

function serialize(evt): [string, boolean] {
  let parts = [];
  for (const [key, func] of specials) {
    if (func(evt)) {
      parts.push(key);
    }
  }
  const hasSpecials = specials.has(evt.key.toLowerCase());
  if (!hasSpecials && evt.key) {
    parts.push(evt.key);
  }
  return [parts.join("+"), hasSpecials];
}

const initialState = {};
export function ShortcutProvider(props) {
  const [shortcuts, dispatch] = useReducer(registry, initialState);
  const [hints, dispatchHint] = useReducer(hint, initialHintState);

  const setHints = useCallback(
    (combinations) => {
      dispatchHint({
        type: "SET",
        combinations,
      });
    },
    [dispatchHint]
  );

  const helpCombination = "shift+?";
  const isHelp = useRef(false);

  const onKeyDown = useCallback(
    (evt) => {
      const [combination] = serialize(evt);
      if (shortcuts[combination]) {
        Object.values(shortcuts[combination]).forEach((callback) => {
          callback(evt);
        });
      }
      if (combination === helpCombination) {
        isHelp.current = !isHelp.current;
      }
      let combinations: { [key: string]: boolean } = {};
      for (const key in shortcuts) {
        if (combination === helpCombination) {
          combinations[key] = isHelp.current;
        } else if (key.startsWith(combination)) {
          combinations[key] = true;
        }
      }
      setHints(combinations);
    },
    [shortcuts, setHints]
  );

  const onKeyUp = useCallback(
    (evt) => {
      const [combination, hasSpecials] = serialize(evt);
      let combinations = {};
      if (!isHelp.current) {
        if (
          (hasSpecials && combination.length === 0) ||
          (hasSpecials === false && evt.key === combination)
        ) {
          dispatchHint({
            type: "RESET",
          });
        } else {
          for (const key in shortcuts) {
            if (!key.startsWith(combination)) {
              combinations[key] = false;
            }
          }
          setHints(combinations);
        }
      }
    },
    [setHints, shortcuts]
  );

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [onKeyDown, onKeyUp]);

  const register = useCallback(
    (combination: string | null, callback) => {
      if (combination === null) {
        return;
      }
      dispatch({
        type: "REGISTER",
        combination,
        callback,
      });
    },
    [dispatch]
  );

  const unregister = useCallback(
    (combination: string | null, callback) => {
      if (combination === null) {
        return;
      }
      dispatch({
        type: "UNREGISTER",
        combination,
        callback,
      });
    },
    [dispatch]
  );

  const context = useMemo(
    () => ({
      register,
      unregister,
      shortcuts,
      hints,
      setHints,
    }),
    [register, unregister, shortcuts, hints, setHints]
  );

  return <ShortcutContext.Provider value={context} {...props} />;
}

export function useShortcut() {
  return useContext(ShortcutContext);
}

export function useRegisterShortcut(
  combination: string | null | undefined,
  callback: any,
  dependencies?: any
) {
  const { register, unregister, hints } = useShortcut();
  const memoed = useCallback(callback, dependencies || []);

  useEffect(() => {
    register(combination, memoed);
    return () => unregister(combination, memoed);
  }, [register, unregister, combination, memoed]);
  return {
    isActive: hints[combination],
  };
}

export function useShortcutIsActive(combination: string) {
  const { hints } = useShortcut();
  return hints[combination];
}
