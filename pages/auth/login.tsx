import { signIn } from "next-auth/react";
import { Title, TwitterLogo } from "@/components";

export default function Login() {
  return (
    <div className="max-w-prose mx-auto w-full min-h-screen flex flex-col px-2">
      <Title />
      <div className="flex flex-col justify-center items-center space-y-20 flex-1">
        <h2 className="text-3xl font-bold text-center">
          Keep your Twitter timeline pertinent!
        </h2>
        <button
          onClick={() => signIn("twitter")}
          className="bg-[#1D8EEF] flex justify-between items-center px-4 py-2 rounded-md space-x-2 hover:bg-[#1974CA]"
        >
          <TwitterLogo />
          <span>Login with Twitter</span>
        </button>
        <div>
          <p className="mb-3">Kip will help you:</p>
          <ol className="list-decimal list-inside font-thin">
            <li>Go through each account you follow,</li>
            <li>Read their latest tweets,</li>
            <li>Keep following them,</li>
            <li>or un-follow them.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
