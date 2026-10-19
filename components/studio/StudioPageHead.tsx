import type { ReactNode } from "react";

export function StudioPageHead({
  title,
  note,
  action,
}: {
  title: string;
  note: string;
  action?: ReactNode;
}) {
  return (
    <div className="studio-page-head">
      <div>
        <h1>{title}</h1>
        <p>{note}</p>
      </div>
      {action}
    </div>
  );
}
