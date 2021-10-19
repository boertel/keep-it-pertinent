import {signIn} from "next-auth/react"
import {Title, Link} from '@/components'
console.log(signIn)

export default function Login() {
  return (
    <div className="max-w-prose mx-auto w-full">
      <Title />
      <button onClick={() => signIn('twitter')}>Login with Twitter</button>
    </div>
  )
}
