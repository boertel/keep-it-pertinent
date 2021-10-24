import { Dialog as HeadlessDialog, Transition } from "@headlessui/react";
import { Fragment, ReactNode } from "react";

function Dialog({
  isOpen,
  onClose,
  children,
  initialFocus,
  afterLeave,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  initialFocus?: any;
  afterLeave?: () => void;
}) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <HeadlessDialog
        as="div"
        className="fixed inset-0 z-30 overflow-y-auto"
        onClose={onClose}
        initialFocus={initialFocus}
      >
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={afterLeave}
          >
            <HeadlessDialog.Overlay className="fixed inset-0 bg-black opacity-80" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="inline-block h-screen align-middle"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="inline-block w-full max-w-xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-black border-2 border-red-400 rounded-xl">
              {children}
            </div>
          </Transition.Child>
        </div>
      </HeadlessDialog>
    </Transition>
  );
}

Dialog.Title = function DialogTitle(props: any) {
  return (
    <HeadlessDialog.Title
      as="h3"
      className="text-2xl font-medium leading-6 text-red-500"
      {...props}
    />
  );
};

Dialog.Content = function DialogContent(props: any) {
  return (
    <div className="mt-8">
      <p className="text-sm text-white" {...props} />
    </div>
  );
};

Dialog.Footer = function DialogFooter(props: any) {
  return (
    <div
      className="mt-6 flex flex-row justify-end space-x-2 flex-wrap"
      {...props}
    />
  );
};

export default Dialog;
