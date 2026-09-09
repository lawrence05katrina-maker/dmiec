import { useEffect, useRef } from "react";

type ExamSecurityOptions = {
  enabled: boolean;
  onViolation: (reason: string) => void;
};

export function useExamSecurity({
  enabled,
  onViolation,
}: ExamSecurityOptions) {
  const violatedRef = useRef(false);
  const fullscreenWasActiveRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    violatedRef.current = false;
    fullscreenWasActiveRef.current = !!document.fullscreenElement;

    const violate = (reason: string) => {
      if (violatedRef.current) return;

      violatedRef.current = true;
      onViolation(reason);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        violate(
          "Test cancelled: You switched tabs, minimized the browser, or left the test window."
        );
      }
    };

    const handleBlur = () => {
      violate(
        "Test cancelled: The browser window lost focus."
      );
    };

    const handleFullscreenChange = () => {
      if (document.fullscreenElement) {
        fullscreenWasActiveRef.current = true;
      } else if (fullscreenWasActiveRef.current) {
        violate(
          "Test cancelled: Fullscreen mode was exited."
        );
      }
    };

    const handleBeforePrint = () => {
      violate(
        "Test cancelled: Printing is not allowed during the test."
      );
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.ctrlKey &&
        ["p", "u", "c", "x", "v"].includes(
          event.key.toLowerCase()
        )
      ) {
        event.preventDefault();

        violate(
          "Test cancelled: This keyboard action is not allowed during the test."
        );

        return;
      }

      if (
        event.ctrlKey &&
        event.shiftKey &&
        event.key.toLowerCase() === "i"
      ) {
        event.preventDefault();

        violate(
          "Test cancelled: Developer tools are not allowed during the test."
        );

        return;
      }

      if (event.key === "F12") {
        event.preventDefault();

        violate(
          "Test cancelled: Developer tools are not allowed during the test."
        );
      }
    };

    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();

      violate(
        "Test cancelled: Right-click is not allowed during the test."
      );
    };

    const handleCopy = (event: ClipboardEvent) => {
      event.preventDefault();

      violate(
        "Test cancelled: Copying is not allowed during the test."
      );
    };

    const handleCut = (event: ClipboardEvent) => {
      event.preventDefault();

      violate(
        "Test cancelled: Cutting is not allowed during the test."
      );
    };

    const handlePaste = (event: ClipboardEvent) => {
      event.preventDefault();

      violate(
        "Test cancelled: Pasting is not allowed during the test."
      );
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    window.addEventListener("blur", handleBlur);

    document.addEventListener(
      "fullscreenchange",
      handleFullscreenChange
    );

    window.addEventListener(
      "beforeprint",
      handleBeforePrint
    );

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    document.addEventListener(
      "contextmenu",
      handleContextMenu
    );

    document.addEventListener(
      "copy",
      handleCopy
    );

    document.addEventListener(
      "cut",
      handleCut
    );

    document.addEventListener(
      "paste",
      handlePaste
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );

      window.removeEventListener(
        "blur",
        handleBlur
      );

      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange
      );

      window.removeEventListener(
        "beforeprint",
        handleBeforePrint
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      document.removeEventListener(
        "contextmenu",
        handleContextMenu
      );

      document.removeEventListener(
        "copy",
        handleCopy
      );

      document.removeEventListener(
        "cut",
        handleCut
      );

      document.removeEventListener(
        "paste",
        handlePaste
      );
    };
  }, [enabled, onViolation]);
}