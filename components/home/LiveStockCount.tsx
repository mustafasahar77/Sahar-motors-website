"use client";

import { useEffect, useState } from "react";
import { apiList } from "@/lib/adminApi";

// Live count of available vehicles, seeded with the build-time number so the
// hero stat matches the live inventory (and never shows an empty flash).
export default function LiveStockCount({ fallback }: { fallback: number }) {
  const [count, setCount] = useState(fallback);

  useEffect(() => {
    let alive = true;
    apiList()
      .then((list) => {
        if (alive && Array.isArray(list) && list.length) {
          setCount(list.filter((v) => v.status === "available").length);
        }
      })
      .catch(() => {
        /* keep the build-time fallback */
      });
    return () => {
      alive = false;
    };
  }, []);

  return <span className="font-bold text-white">{count}</span>;
}
