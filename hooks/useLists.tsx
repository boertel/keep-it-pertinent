import React, { useContext, ReactNode, useMemo, createContext } from "react";
import useSWR from "swr";

interface List {
  id: string;
  name: string;
}

interface Members {
  [key: string]: boolean;
}

interface ListsReturn {
  lists: List[];
  favoriteListId?: string;
  favorites: Members;
}

const ListsContext = createContext({});

export function ListsProvider({ children }: { children: ReactNode }) {
  const { data: lists = [] } = useSWR<List[]>("/api/twitter/lists");

  const favorite = lists.find(({ name }) => name === "favorites");
  const favoriteListId: string | undefined = favorite?.id;

  const { data: favorites = {} } = useSWR<Members>(
    favoriteListId ? `/api/twitter/lists/${favoriteListId}/` : null
  );

  const context: ListsReturn = useMemo(
    () => ({
      lists,
      favoriteListId,
      favorites,
    }),
    [lists, favorites, favoriteListId]
  );
  return (
    <ListsContext.Provider value={context}>{children}</ListsContext.Provider>
  );
}

export function useLists(): ListsReturn {
  return useContext(ListsContext) as ListsReturn;
}
