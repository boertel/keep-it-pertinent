import { useEffect, useCallback, useState, useRef, ReactNode } from "react";
import { useRouter, NextRouter } from "next/router";
import cn from "classnames";
import { Dialog, Link, Dropdown, Button } from "@/components";
import { useRegisterShortcut, useShortcutIsActive } from "@/hooks/useShortcut";
import { useSWRConfig } from "swr";
import { useLists } from "@/hooks";

import { useFollowers } from "./Followers";

function useCurrentUsername(): string | undefined {
  const router: NextRouter = useRouter();
  const { username } = router.query;
  if (Array.isArray(username)) {
    return username[0];
  }
  return username;
}

export default function Footer({ userId }: { userId: string }) {
  const router: NextRouter = useRouter();
  const username = useCurrentUsername();

  const [isUnfollowConfirmationOpen, setIsUnfollowConfirmationOpen] =
    useState<boolean>(false);
  const closeUnfollowConfirmation = () => setIsUnfollowConfirmationOpen(false);
  const { next, previous } = useFollowers(username) as {
    next: any;
    previous: any;
  };

  const { favorites, favoriteListId } = useLists();

  const { mutate } = useSWRConfig();

  const unfollow = useCallback(() => {
    if (username) {
      fetch(`/api/twitter/unfollow`, {
        body: JSON.stringify({ username, userId }),
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      mutate(
        "/api/twitter/followers",
        (followers: any) => {
          return {
            data: followers.data.filter(
              (prev: any) => prev.username !== username
            ),
          };
        },
        false
      );
      if (next) {
        router.push(`/u/${next.username}`);
      } else {
        router.push(`/`);
      }
    }
  }, [username, router, next, mutate, userId]);

  const confirmUnfollow = useCallback(async () => {
    const showConfirmations = JSON.parse(
      sessionStorage.getItem("showConfirmations") || "{}"
    );
    if (showConfirmations.unfollow !== false) {
      setIsUnfollowConfirmationOpen(true);
    } else {
      unfollow();
    }
  }, [setIsUnfollowConfirmationOpen, unfollow]);

  useRegisterShortcut(
    "Escape",
    () => {
      if (!isUnfollowConfirmationOpen) {
        router.push("/");
      }
    },
    [router, isUnfollowConfirmationOpen]
  );

  return (
    <footer
      className={cn(
        "border-t border-gray-700 sticky bottom-0 bg-black pt-2 pb-4 flex flex-col items-center space-y-2 z-20 opacity-100 transition-opacity px-2"
      )}
    >
      <h3 className="mb-2 text-center font-bold text-lg">
        Are these tweets still pertinent to you?
        <Favorite
          username={username}
          userId={userId}
          isFavorite={username ? favorites[username] : false}
          favoriteListId={favoriteListId}
        />
      </h3>
      <div className="grid gap-y-4 gap-x-4 grid-rows-2 sm:grid-rows-none sm:grid-flow-col-dense">
        {previous && (
          <Button
            as={Link}
            href={`/u/${previous.username}`}
            className="pr-12 border-none text-blue-400 hover:underline"
            shortcut="shift+B"
          >
            <CommandKey shortcut="shift+B" />B
            <NotShortcut shortcut="shift+B">ack </NotShortcut>
          </Button>
        )}
        <Button
          className="pr-12 border-red-400 hover:bg-red-400 hover:bg-opacity-30 focus:ring-red-400"
          shortcut="shift+U"
          onClick={confirmUnfollow}
        >
          <CommandKey shortcut="shift+U" /> U
          <NotShortcut shortcut="shift+U">n-follow</NotShortcut>
        </Button>
        <UnfollowConfirmationDialog
          username={username}
          isOpen={isUnfollowConfirmationOpen}
          onClose={closeUnfollowConfirmation}
          onConfirm={unfollow}
        />
        <ListDropdown username={username} />
        {next && (
          <Button
            className="pr-12 border-green-400 hover:bg-green-400 hover:bg-opacity-30"
            shortcut="shift+N"
            as={Link}
            href={`/u/${next.username}`}
          >
            <CommandKey shortcut="shift+N" />N
            <NotShortcut shortcut="shift+N">ext</NotShortcut>
          </Button>
        )}
      </div>
    </footer>
  );
}

function Favorite({
  username,
  isFavorite,
  userId,
  favoriteListId,
}: {
  username?: string;
  userId?: string;
  isFavorite: boolean;
  favoriteListId?: string;
}) {
  const [favorited, setFavorited] = useState<boolean>(false);
  const { mutate } = useSWRConfig();

  const moveToFavorite = useCallback(async () => {
    if (username && userId) {
      fetch(`/api/twitter/favorite`, {
        body: JSON.stringify({ username, userId }),
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      mutate(
        `/api/twitter/lists/${favoriteListId}`,
        (prev: { [key: string]: true }) => {
          return {
            ...prev,
            [username]: true,
          };
        },
        false
      );
    }
    setFavorited(true);
  }, [username, userId, favoriteListId, mutate]);

  const removeFromFavorite = useCallback(async () => {
    if (username) {
      fetch(`/api/twitter/favorite`, {
        body: JSON.stringify({ username }),
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      mutate(
        `/api/twitter/lists/${favoriteListId}`,
        (prev: { [key: string]: true }) => {
          const removed: { [key: string]: true } = { ...prev };
          delete removed[username];
          return removed;
        },
        false
      );
    }
    setFavorited(true);
  }, [username, favoriteListId, mutate]);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (favorited) {
      timeout = setTimeout(() => {
        setFavorited(false);
      }, 2000);
    }
    return () => clearTimeout(timeout);
  }, [favorited, setFavorited]);

  return (
    <Button
      className="py-2 border-none text-red-400 relative"
      shortcut="shift+L"
      onClick={isFavorite ? removeFromFavorite : moveToFavorite}
    >
      <CommandKey shortcut="shift+L" />
      <Shortcut shortcut="shift+L">L</Shortcut>
      <NotShortcut
        shortcut="shift+L"
        style={{
          animationIterationCount: 4,
        }}
        className={cn("inline-block", { "animate-ping": favorited })}
      >
        {isFavorite ? <>💔</> : <>❤️ </>}
      </NotShortcut>
    </Button>
  );
}

function ListDropdown({ username }: { username?: string | string[] }) {
  const [moved, setMoved] = useState<string | null>(null);
  const button = useRef<HTMLButtonElement>();
  const { lists } = useLists();

  const moveToList = useCallback(
    async (list) => {
      if (username) {
        fetch(`/api/twitter/lists/${list.id}`, {
          body: JSON.stringify({ username }),
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
      }
      setMoved(list.name);
      if (button.current) {
        button.current.click();
      }
    },
    [username]
  );

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (moved) {
      timeout = setTimeout(() => {
        setMoved(null);
      }, 2000);
    }
    return () => clearTimeout(timeout);
  }, [moved, setMoved]);

  return (
    <Dropdown>
      {({ open }: { open: boolean }) => (
        <>
          <Dropdown.Button
            ref={button}
            as={Button}
            shortcut="shift+M"
            className="pr-12 border-yellow-400 hover:bg-yellow-400 hover:bg-opacity-30 focus:ring-yellow-400 relative"
          >
            <>
              <div
                className={cn(
                  "absolute inset-0 flex items-center justify-center text-yellow-400 pointer-events-none opacity-0",
                  { "opacity-100": !!moved }
                )}
              >
                Moved!
              </div>
              <div className={cn({ invisible: !!moved })}>
                <CommandKey shortcut="shift+M" /> M
                <NotShortcut shortcut="shift+M">ove to List</NotShortcut>
              </div>
            </>
          </Dropdown.Button>
          <Dropdown.Items open={open}>
            {lists.map((list: any, index: number) => (
              <DropdownListItem
                key={list.id}
                id={list.id}
                onClick={() => {
                  moveToList(list);
                }}
                name={list.name}
                index={`${index + 1}`}
              />
            ))}
          </Dropdown.Items>
        </>
      )}
    </Dropdown>
  );
}

function DropdownListItem({
  id,
  name,
  index,
  onClick,
}: {
  id: string;
  name: string;
  index: string;
  onClick: () => void;
}) {
  useRegisterShortcut(index, onClick);

  return (
    <Dropdown.ItemButton
      key={id}
      onClick={onClick}
      className="flex justify-between"
    >
      <div>{name}</div>
      <div className="text-white text-opacity-40">{index}</div>
    </Dropdown.ItemButton>
  );
}

function UnfollowConfirmationDialog({
  username,
  isOpen,
  onClose,
  onConfirm,
}: {
  username?: string | string[];
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const focusButton = useRef<HTMLButtonElement>();
  const didConfirm = useRef<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [checkbox, setCheckbox] = useState<boolean>(false);

  const handleOnConfirm = useCallback(() => {
    didConfirm.current = true;
    setIsLoading(true);
    sessionStorage.setItem(
      "showConfirmations",
      JSON.stringify({ unfollow: !checkbox })
    );
    onClose();
    setIsLoading(false);
  }, [onClose, setIsLoading, checkbox]);

  const confirmAfterTransition = useCallback(() => {
    // so next username doesn't flash in the modal after confirming the un-follow
    if (didConfirm.current) {
      onConfirm();
    }
  }, [onConfirm]);

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      initialFocus={focusButton}
      afterLeave={confirmAfterTransition}
    >
      <>
        <Dialog.Title>Danger!</Dialog.Title>
        <Dialog.Content>
          <label>
            <input
              type="checkbox"
              className="mr-2 focus:outline-none"
              onChange={(evt) => setCheckbox(evt.target.checked)}
            />{" "}
            Don&apos;t show this warning when un-following accounts.
          </label>
        </Dialog.Content>
        <Dialog.Footer>
          <Button
            className="border-gray-300 text-gray-300 hover:bg-gray-300 hover:bg-opacity-20  focus:ring-gray-300"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="bg-red-500 focus:bg-red-600 hover:bg-red-600 text-black focus:ring-red-500 border-none"
            onClick={handleOnConfirm}
            isLoading={isLoading}
            ref={focusButton}
          >
            Yes, I want to <b>un-follow</b> {username}
          </Button>
        </Dialog.Footer>
      </>
    </Dialog>
  );
}

function CommandKey({ shortcut }: { shortcut: string }) {
  return <Shortcut shortcut={shortcut}>⇧&nbsp;</Shortcut>;
}

function Shortcut({
  className,
  shortcut,
  children,
  ...props
}: {
  className?: any;
  children: ReactNode;
  shortcut: string;
}) {
  const isActive = useShortcutIsActive(shortcut);
  return (
    <span
      className={cn(className, "transition-opacity opacity-0", {
        "opacity-100": isActive,
      })}
      {...props}
    >
      {children}
    </span>
  );
}

function NotShortcut({
  className,
  shortcut,
  children,
  style,
  ...props
}: {
  className?: any;
  children: ReactNode;
  style?: any;
  shortcut: string;
}) {
  const isActive = useShortcutIsActive(shortcut);
  return (
    <span
      className={cn(className, "transition-opacity opacity-100", {
        "opacity-20": isActive,
      })}
      {...props}
    >
      {children}
    </span>
  );
}
