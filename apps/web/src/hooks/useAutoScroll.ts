import { useEffect, useRef } from "react"
import type { DependencyList } from "react"

const AUTO_SCROLL_THRESHOLD = 120

export function useAutoScroll<T extends HTMLElement>(deps: DependencyList) {
  const scrollContainerRef = useRef<T | null>(null)
  const shouldAutoScrollRef = useRef(true)

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) {
      return
    }

    const handleScroll = () => {
      const distanceToBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight
      shouldAutoScrollRef.current = distanceToBottom <= AUTO_SCROLL_THRESHOLD
    }

    handleScroll()
    container.addEventListener("scroll", handleScroll)
    return () => {
      container.removeEventListener("scroll", handleScroll)
    }
  }, [])

  useEffect(() => {
    if (!shouldAutoScrollRef.current) {
      return
    }

    const container = scrollContainerRef.current
    if (!container) {
      return
    }

    container.scrollTop = container.scrollHeight
  }, deps)

  return {
    scrollContainerRef,
    shouldAutoScrollRef,
  }
}
