import { ReactNode } from 'react';

export function Card({ children }: { children: ReactNode }) {
  return <div className="border rounded shadow-sm p-4">{children}</div>;
}
