"use client";

import { useActionState } from "react";
import {
  confirmClientLogo,
  removeClient,
  removeClientLogo,
  reorderClient,
  saveClientRecord,
} from "@/app/studio/(app)/clients/actions";
import { ImageField, OrderButtons, PublishBadge, SaveButton, Status, controlClass } from "@/components/studio/editor";

type ClientRow = { id: string; name: string; website: string; logoUrl: string | null; published: boolean };

export function ClientsStudio({ clients }: { clients: ClientRow[] }) {
  return (
    <div className="studio-stack">
      {clients.length === 0 ? <p className="studio-empty">No clients yet. Add one when you have a real name and logo.</p> : null}
      {clients.map((client) => (
        <ClientForm key={client.id} client={client} />
      ))}
      <ClientForm />
    </div>
  );
}

function ClientForm({ client }: { client?: ClientRow }) {
  const [state, action] = useActionState(saveClientRecord, {});
  const [removeState, removeAction] = useActionState(removeClient, {});
  return (
    <div className="studio-card studio-form">
      <div className="flex items-center justify-between">
        {client ? <PublishBadge published={client.published} /> : <p>New client</p>}
        {client ? <OrderButtons action={(direction) => reorderClient(client.id, direction)} /> : null}
      </div>
      <form action={action} className="grid gap-3">
        {client ? <input type="hidden" name="id" value={client.id} /> : null}
        <Status state={state} />
        <label>
          Name
          <input name="name" defaultValue={client?.name ?? ""} className={controlClass} />
        </label>
        <label>
          Website
          <input name="website" defaultValue={client?.website ?? ""} placeholder="https://" className={controlClass} />
        </label>
        <label className="studio-check">
          <input type="checkbox" name="published" defaultChecked={client?.published ?? false} />
          Published
        </label>
        <SaveButton label={client ? "Save client" : "Add client"} />
      </form>
      {client ? (
        <>
          <ImageField
            label="Logo"
            url={client.logoUrl}
            scope="client"
            ownerId={client.id}
            confirm={(key) => confirmClientLogo(client.id, key)}
            remove={() => removeClientLogo(client.id)}
          />
          <form action={removeAction} className="flex flex-wrap items-center gap-2">
            <input type="hidden" name="id" value={client.id} />
            <Status state={removeState} />
            <input name="confirm" placeholder="Type delete" className={controlClass} />
            <SaveButton label="Delete" tone="danger" />
          </form>
        </>
      ) : null}
    </div>
  );
}
