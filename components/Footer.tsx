import { forwardRef, useState } from "react";
import cn from "classnames";
import { Link, Dropdown } from "@/components";
import { useShortcutIsActive, useRegisterShortcut } from "@/hooks/useShortcut";

export default function Footer() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <footer className="border-t border-gray-700 sticky bottom-0 bg-black pt-2 pb-4 flex flex-col items-center space-y-2">
      <h3 className="mb-4 text-center font-bold text-lg">
        Are these tweets still relevant for you?
        <Button className="py-2 border-none text-red-400" shortcut="shift+L">
          <CommandKey shortcut="shift+L" />
          <Shortcut shortcut="shift+L">L</Shortcut>
          <NotShortcut shortcut="shift+L">❤️</NotShortcut>
        </Button>
      </h3>
      <div className="flex items-center justify-center space-x-3 flex-wrap">
        <Button
          as={Link}
          scroll={false}
          href="/"
          className="pr-12 border-none text-blue-400 hover:underline"
          shortcut="shift+B"
        >
          <CommandKey shortcut="shift+B" /> B
          <NotShortcut shortcut="shift+B">ack </NotShortcut>
        </Button>
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
        <Button
          className="pr-12 border-green-400 hover:bg-green-400 hover:bg-opacity-30"
          shortcut="shift+N"
        >
          <CommandKey shortcut="shift+N" /> N
          <NotShortcut shortcut="shift+N">ext</NotShortcut>
        </Button>
      </div>
    </footer>
  );
}

function CommandKey({ shortcut }: { shortcut: string }) {
  return <Shortcut shortcut={shortcut}>⇧</Shortcut>;
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
      ...props
    }: {
      className?: string;
      shortcut?: string;
      children: ReactNode;
      as: any;
    },
    ref
  ) => {
    useRegisterShortcut(shortcut, console.log);
    return (
      <AsComponent
        ref={ref}
        className={cn("border-2 px-6 py-2 rounded-md", className)}
        {...props}
      >
        {children}
      </AsComponent>
    );
  }
);
