import { useCallback, useState } from "react";

export function useCounter(initial = 0, step = 1) {
  const [value, setValue] = useState<number>(initial);

  const inc = useCallback(() => setValue((v) => v + step), [step]);
  const dec = useCallback(() => setValue((v) => v - step), [step]);
  const reset = useCallback(() => setValue(initial), [initial]);

  return { value, inc, dec, reset } as const;
}
