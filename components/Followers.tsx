import { useCallback, useMemo, createContext, useContext } from "react";
import useSWR from "swr";

interface FollowersReturn {
  followers: any;
  next: string;
  previous: string;
}

const FollowersContext = createContext({});

export function FollowersProvider(props: any) {
  const { data: followers } = useSWR("/api/twitter/followers");

  const next = useCallback(
    (currentUsername?: string) => {
      const currentIndex = followers?.data.findIndex(
        ({ username }) => username === currentUsername
      );
      const nextUsername = followers?.data[currentIndex + 1];
      return nextUsername;
    },
    [followers]
  );

  const previous = useCallback(
    (currentUsername?: string) => {
      const currentIndex = followers?.data.findIndex(
        ({ username }) => username === currentUsername
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

export function useFollowers(currentUsername?: string): FollowersReturn {
  const { followers, next, previous } = useContext(
    FollowersContext
  ) as FollowersReturn;
  return useMemo(
    () => ({
      followers,
      next: next(currentUsername),
      previous: previous(currentUsername),
    }),
    [followers, next, previous, currentUsername]
  );
}
