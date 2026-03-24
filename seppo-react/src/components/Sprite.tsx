import { useEffect, useRef, useState } from 'react'
import type { AnimSet } from '../types'

interface SpriteProps {
  animSet: AnimSet | null
  animKey: string
  animSeq: number
  onComplete?: () => void
  className?: string
}

export default function Sprite({ animSet, animKey, animSeq, onComplete, className = '' }: SpriteProps) {
  const [src, setSrc] = useState('')
  const timerRef = useRef<number>(0)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    if (!animSet) return
    const anim = animSet[animKey]
    if (!anim || !anim.images || anim.images.length === 0) {
      // Fallback: construct src from path
      setSrc(anim ? anim.path + 'frame_000.png' : '')
      return
    }

    clearInterval(timerRef.current)
    let frame = 0
    setSrc(anim.images[0].src)

    if (anim.frames <= 1) return

    timerRef.current = window.setInterval(() => {
      frame++
      if (frame >= anim.frames) {
        if (anim.loop) {
          frame = 0
        } else {
          clearInterval(timerRef.current)
          onCompleteRef.current?.()
          return
        }
      }
      setSrc(anim.images[frame].src)
    }, 1000 / anim.fps)

    return () => clearInterval(timerRef.current)
  }, [animSet, animKey, animSeq])

  if (!src) return null
  return <img src={src} alt="" className={`sprite-canvas ${className}`} />
}
