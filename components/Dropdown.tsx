import { Menu, Transition } from "@headlessui/react";
import cn from "classnames";
import { Fragment } from "react";

export default function Dropdown({ children, open }) {
  return (
    <Menu as="div" className="relative inline-block text-left" open={open}>
      {children}
    </Menu>
  );
}

function Items({ children, className }) {
  return (
    <Transition
      as={Fragment}
      enter="transition ease-out duration-100"
      enterFrom="transform opacity-0 scale-95"
      enterTo="transform opacity-100 scale-100"
      leave="transition ease-in duration-75"
      leaveFrom="transform opacity-100 scale-100"
      leaveTo="transform opacity-0 scale-95"
    >
      <Menu.Items className="absolute bottom-full w-full mb-2 origin-top-right rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none bg-black p-1 border border-gray-700">
        {children}
      </Menu.Items>
    </Transition>
  );
}

function Button({ as, ...props }) {
  return <Menu.Button as={as} {...props} />;
}

function ItemInput(props) {
  return (
    <Menu.Item>
      {({ active }) => (
        <input
          type="text"
          className="border border-gray-700 focus:border-yellow-400 bg-transparent p-2 w-full mb-2 focus:outline-none rounded-md"
          autoFocus={true}
          {...props}
        />
      )}
    </Menu.Item>
  );
}

function ItemButton({ children, ...props }) {
  return (
    <Menu.Item>
      {({ active }) => (
        <button
          className={cn(
            "group flex rounded-md items-center w-full px-2 py-2 text-sm",
            { "bg-yellow-400 bg-opacity-40 text-white": active }
          )}
        >
          {children}
        </button>
      )}
    </Menu.Item>
  );
}

Dropdown.Button = Button;
Dropdown.Items = Items;
Dropdown.ItemButton = ItemButton;
Dropdown.ItemInput = ItemInput;
