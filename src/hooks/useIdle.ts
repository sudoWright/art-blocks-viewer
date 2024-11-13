import { useEffect, useState } from "react";

export function useIdle() {
  const [isIdle, setIsIdle] = useState(false);
  useEffect(() => {
    let timeoutId: number;

    const resetTimer = () => {
      setIsIdle(false);
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setIsIdle(true);
      }, 3000); // 3 seconds with no movement
    };

    // Reset timer on mouse movement or touch
    const handleMovement = () => {
      resetTimer();
    };

    // Initialize timer
    resetTimer();

    // Add event listeners
    window.addEventListener("mousemove", handleMovement);
    window.addEventListener("touchstart", handleMovement);
    window.addEventListener("keydown", handleMovement);
    window.addEventListener("click", handleMovement);

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("mousemove", handleMovement);
      window.removeEventListener("touchstart", handleMovement);
      window.removeEventListener("keydown", handleMovement);
      window.removeEventListener("click", handleMovement);
    };
  }, []);

  return isIdle;
}
