import { useEffect } from 'react'


export default function useEventListener(type: string, callback: (evt) => void) {
  useEffect(() => {
    window.addEventListener(type, callback)
    return () => window.removeEventListener(type, callback)
  }, [type, callback])
}
