import { useCallback, useMemo, createContext, useContext } from "react";
import useSWR from "swr";

interface FollowersReturn {
  followers: any;
  next: string;
  previous: string;
}

interface User {
  id: string;
  avatar: string;
  username: string;
}

const FollowersContext = createContext({});

export function FollowersProvider(props: any) {
  const { data: followers } = useSWR("/api/twitter/followers");

  const next = useCallback(
    (currentUsername?: string | string[]) => {
      const currentIndex = followers?.data.findIndex(
        ({ username }: { username: string }) => username === currentUsername
      );
      const nextUsername = followers?.data[currentIndex + 1];
      return nextUsername;
    },
    [followers]
  );

  const previous = useCallback(
    (currentUsername?: string | string[]) => {
      const currentIndex = followers?.data.findIndex(
        ({ username }: { username: string }) => username === currentUsername
      );
      const previousUsername = followers?.data[currentIndex - 1];
      return previousUsername;
    },
    [followers]
  );

  const context = useMemo(
    () => ({
      followers,
      next,
      previous,
    }),
    [followers]
  );
  return <FollowersContext.Provider value={context} {...props} />;
}

export function useFollowers(
  currentUsername?: string | string[]
): FollowersReturn {
  const { followers, next, previous } = useContext(
    FollowersContext
  ) as FollowersReturn & {
    next: (username?: string | string[]) => any;
    previous: (username?: string | string[]) => any;
  };
  return useMemo(
    () => ({
      followers,
      next: next(currentUsername),
      previous: previous(currentUsername),
    }),
    [followers, next, previous, currentUsername]
  );
}
