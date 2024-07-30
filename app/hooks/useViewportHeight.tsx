import { useEffect } from 'react'

const useViewportHeight = () => {
  useEffect(() => {
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty('--vh', `${vh}px`)
    }

    // Set the initial value
    setViewportHeight()

    // Add event listener to update the value on resize
    window.addEventListener('resize', setViewportHeight)

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener('resize', setViewportHeight)
    }
  }, [])
}

export default useViewportHeight
