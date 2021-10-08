import { MouseEvent, useCallback, forwardRef, useState } from "react";
import { useRouter } from "next/router";
import cn from "classnames";
import { Link, Dropdown } from "@/components";
import { useShortcutIsActive, useRegisterShortcut } from "@/hooks/useShortcut";
import useSWR, { useSWRConfig } from "swr";

import { useFollowers } from "./Followers";

export default function Footer() {
  const router = useRouter();
  const { username } = router.query;

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { next, previous } = useFollowers(username);
  const { mutate } = useSWRConfig();

  const favorite = useCallback(
    async (evt?: MouseEvent<HTMLButtonElement>) => {
      if (username) {
      }
    },
    [mutate, username]
  );

  return (
    <footer className="border-t border-gray-700 sticky bottom-0 bg-black pt-2 pb-4 flex flex-col items-center space-y-2">
      <h3 className="mb-4 text-center font-bold text-lg">
        Are these tweets still relevant for you?
        <Button
          className="py-2 border-none text-red-400"
          shortcut="shift+L"
          onClick={favorite}
        >
          <CommandKey shortcut="shift+L" />
          <Shortcut shortcut="shift+L">L</Shortcut>
          <NotShortcut shortcut="shift+L">❤️</NotShortcut>
        </Button>
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
          className="pr-12 border-red-400 hover:bg-red-400 hover:bg-opacity-30"
          shortcut="shift+U"
        >
          <CommandKey shortcut="shift+U" /> U
          <NotShortcut shortcut="shift+U">n-follow</NotShortcut>
        </Button>
        <Dropdown open={isOpen}>
          <Dropdown.Button
            onClick={() => setIsOpen(true)}
            as={Button}
            className="pr-12 border-yellow-400 hover:bg-yellow-400 hover:bg-opacity-30"
            shortcut="shift+M"
          >
            <CommandKey shortcut="shift+M" /> M
            <NotShortcut shortcut="shift+M">ove to List</NotShortcut>
          </Dropdown.Button>
          <Dropdown.Items className="p-1">
            <Dropdown.ItemButton>❤️</Dropdown.ItemButton>
            <Dropdown.ItemButton>probation</Dropdown.ItemButton>
          </Dropdown.Items>
        </Dropdown>
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

function CommandKey({ shortcut }: { shortcut: string }) {
  return <Shortcut shortcut={shortcut}>⇧&nbsp;</Shortcut>;
}

function Shortcut({ className, shortcut, ...props }) {
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

function NotShortcut({ className, shortcut, ...props }) {
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
      shortcut,
      as: AsComponent = "button",
      onClick,
      href,
      ...props
    }: {
      className?: string;
      shortcut?: string;
      children: ReactNode;
      onClick: (evt: any) => void;
      href?: string;
      as: any;
    },
    ref
  ) => {
    const router = useRouter();
    const onShortcut = useCallback(() => {
      if (href) {
        return router.push(href);
      }
    }, [href]);
    useRegisterShortcut(shortcut, onShortcut, [href]);
    return (
      <AsComponent
        ref={ref}
        className={cn("border-2 px-6 py-2 rounded-md", className)}
        onClick={onClick}
        href={href}
        {...props}
      >
        {children}
      </AsComponent>
    );
  }
);
