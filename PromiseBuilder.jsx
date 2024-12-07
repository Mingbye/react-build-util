import { useEffect, useState } from "react";

export default function PromiseBuilder({
  promise,
  build = (snapshot) => null,
}) {
  const [snapshot,setSnapshot]=useState(null);

  useEffect(() => {
    (async () => {
      if(promise==null){
        setSnapshot(null);
        return;
      }

      let result = undefined;
      try {
        result = await promise;
      } catch (e) {
        setSnapshot([false,e]);
        return;
      }

      setSnapshot([true, result]);
    })();
  }, [promise]);

  return build(snapshot);
}

