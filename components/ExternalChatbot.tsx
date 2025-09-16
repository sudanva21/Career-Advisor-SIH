'use client'

import { useEffect } from 'react'

export default function ExternalChatbot() {
  useEffect(() => {
    // Initialize the external chatbot
    const initializeChatbot = () => {
      // Set up the chatbase proxy function
      if (!window.chatbase || window.chatbase("getState") !== "initialized") {
        window.chatbase = (...args: any[]) => {
          if (!window.chatbase.q) {
            window.chatbase.q = []
          }
          window.chatbase.q.push(args)
        }

        // Create proxy for additional methods
        window.chatbase = new Proxy(window.chatbase, {
          get(target: any, prop: string) {
            if (prop === "q") {
              return target.q
            }
            return (...args: any[]) => target(prop, ...args)
          }
        })
      }

      // Load the external chatbot script
      const onLoad = () => {
        const script = document.createElement("script")
        script.src = "https://www.chatbase.co/embed.min.js"
        script.id = "g4lkPQuyUxkwplE-yRlpo"
        script.setAttribute("domain", "www.chatbase.co")
        document.body.appendChild(script)
      }

      if (document.readyState === "complete") {
        onLoad()
      } else {
        window.addEventListener("load", onLoad)
      }
    }

    initializeChatbot()

    // Cleanup function to remove the script when component unmounts
    return () => {
      const existingScript = document.getElementById("g4lkPQuyUxkwplE-yRlpo")
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [])

  return null // This component doesn't render any JSX, just manages the external script
}

// Extend window interface for TypeScript
declare global {
  interface Window {
    chatbase: any
  }
}