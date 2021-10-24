import { useCallback, forwardRef, ReactNode } from "react";
import cn from "classnames";
import { useRouter } from "next/router";
import { useRegisterShortcut } from "@/hooks/useShortcut";

const Button = forwardRef(function _Button(
  { shortcut, ...rest }: { shortcut?: string; [x: string]: any },
  ref
) {
  if (shortcut) {
    return <ButtonWithShortcut shortcut={shortcut} ref={ref} {...rest} />;
  } else {
    return <ButtonWithoutShortcut ref={ref} {...rest} />;
  }
});

export default Button;

const ButtonWithShortcut = forwardRef(function ButtonWithShortcutAndRef(
  {
    onClick,
    href = null,
    shortcut,
    ...rest
  }: {
    shortcut?: string;
    onClick?: (evt: any) => void;
    href?: string | null;
  },
  ref
) {
  const router = useRouter();
  const onShortcut = useCallback(
    (evt: any) => {
      if (href) {
        return router.push(href);
      } else if (onClick) {
        onClick(evt);
      }
    },
    [href, onClick, router]
  );
  useRegisterShortcut(shortcut, onShortcut, [onShortcut]);
  return (
    <ButtonWithoutShortcut onClick={onClick} href={href} ref={ref} {...rest} />
  );
});

const ButtonWithoutShortcut = forwardRef(function FooterButton(
  {
    className,
    children,
    as: AsComponent = "button",
    isLoading,
    onClick = null,
    href = null,
    ...props
  }: {
    className?: string;
    onClick?: any | null;
    children?: ReactNode;
    isLoading?: boolean;
    href?: string | null;
    as?: any;
  },
  ref
) {
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
});
