import { useState, useEffect, useCallback } from "react";

export function useSearchParams() {
  const [params, setParams] = useState<Record<string, string | undefined>>({});

  useEffect(() => {
    const handleUrlChange = () => {
      const newParams = new URLSearchParams(window.location.search);
      const paramObj: Record<string, string> = {};
      newParams.forEach((value, key) => {
        paramObj[key] = value;
      });
      setParams(paramObj);
    };

    handleUrlChange();

    window.addEventListener("popstate", handleUrlChange);
    return () => window.removeEventListener("popstate", handleUrlChange);
  }, []);

  const setSearchParam = useCallback(
    (param: string, value: string | undefined) => {
      const newParams = new URLSearchParams(window.location.search);

      if (value === undefined) {
        newParams.delete(param);
        window.history.pushState({}, "", `?${newParams}`);
        window.dispatchEvent(new Event("popstate"));
        return;
      }

      newParams.set(param, value);
      window.history.pushState({}, "", `?${newParams}`);
      window.dispatchEvent(new Event("popstate"));
    },
    []
  );

  return { params, setSearchParam };
}
