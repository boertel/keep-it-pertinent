import { useEffect, useRef, useCallback, forwardRef, useState } from "react";
import { useRouter } from "next/router";
import cn from "classnames";
import { Dialog, Link, Dropdown } from "@/components";
import { useShortcutIsActive, useRegisterShortcut } from "@/hooks/useShortcut";
import useSWR, { useSWRConfig } from "swr";

import { useFollowers } from "./Followers";

export default function Footer() {
  const router = useRouter();
  const { username } = router.query;

  const [isUnfollowConfirmationOpen, setIsUnfollowConfirmationOpen] =
    useState<boolean>(false);
  const closeUnfollowConfirmation = () => setIsUnfollowConfirmationOpen(false);
  const { next, previous } = useFollowers(username);

  const { mutate } = useSWRConfig();

  const unfollow = useCallback(() => {
    if (username) {
      fetch(`/api/twitter/unfollow`, {
        body: JSON.stringify({ username }),
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      mutate(
        "/api/twitter/followers",
        (followers) => {
          return {
            data: followers.data.filter((prev) => prev.username !== username),
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
  }, [username, router, next]);

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
    <footer className="border-t border-gray-700 sticky bottom-0 bg-black pt-2 pb-4 flex flex-col items-center space-y-2 z-20">
      <h3 className="mb-4 text-center font-bold text-lg">
        Are these tweets still relevant to you?
        <Favorite username={username} />
      </h3>
      <div className="flex items-center justify-center space-x-3 flex-wrap">
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

function Favorite({ username }) {
  const [favorited, setFavorited] = useState<boolean>(false);

  const moveToFavorite = useCallback(async () => {
    if (username) {
      fetch(`/api/twitter/favorite`, {
        body: JSON.stringify({ username }),
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    }
    setFavorited(true);
  }, [username]);

  useEffect(() => {
    let timeout;
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
      onClick={moveToFavorite}
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
        ❤️
      </NotShortcut>
    </Button>
  );
}

function ListDropdown({ username }: { username: string }) {
  const [moved, setMoved] = useState<string | null>(null);
  const button = useRef<HTMLButtonElement>();
  const { data: lists = [] } = useSWR("/api/twitter/lists");

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
    let timeout;
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
          <Dropdown.Items className="p-1" open={open}>
            {lists.map((list, index) => (
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

function UnfollowConfirmationDialog({ username, isOpen, onClose, onConfirm }) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [checkbox, setCheckbox] = useState<boolean>(false);

  const handleOnConfirm = async () => {
    setIsLoading(true);
    sessionStorage.setItem(
      "showConfirmations",
      JSON.stringify({ unfollow: !checkbox })
    );
    await onConfirm();
    setIsLoading(false);
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <>
        <Dialog.Title>Danger!</Dialog.Title>
        <Dialog.Content>
          <label>
            <input
              type="checkbox"
              className="mr-2 focus:outline-none"
              onChange={(evt) => setCheckbox(evt.target.checked)}
            />{" "}
            Don't show this warning when un-following accounts.
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
  ...props
}: {
  className?: any;
  shortcut: string;
}) {
  const isActive = useShortcutIsActive(shortcut);
  return (
    <span
      className={cn(className, "transition-opacity opacity-0", {
        "opacity-100": isActive,
      })}
      {...props}
    />
  );
}

function NotShortcut({
  className,
  shortcut,
  ...props
}: {
  className?: any;
  shortcut: string;
}) {
  const isActive = useShortcutIsActive(shortcut);
  return (
    <span
      className={cn(className, "transition-opacity opacity-100", {
        "opacity-20": isActive,
      })}
      {...props}
    />
  );
}

const Button = forwardRef(
  (
    {
      className,
      children,
      shortcut = null,
      as: AsComponent = "button",
      onClick,
      href,
      isLoading,
      ...props
    }: {
      className?: string;
      shortcut?: string;
      children: ReactNode;
      onClick: (evt: any) => void;
      href?: string;
      isLoading?: boolean;
      as: any;
    },
    ref
  ) => {
    const router = useRouter();
    const onShortcut = useCallback(
      (evt: any) => {
        if (href) {
          return router.push(href);
        } else {
          onClick(evt);
        }
      },
      [href, onClick]
    );
    useRegisterShortcut(shortcut, onShortcut, [href, onClick]);
    return (
      <AsComponent
        ref={ref}
        className={cn(
          "border-2 px-6 py-2 rounded-md focus:outline-none focus:ring-opacity-30 focus:ring-4",
          className
        )}
        onClick={onClick}
        href={href}
        {...props}
      >
        {isLoading ? <>Saving...</> : children}
      </AsComponent>
    );
  }
);
