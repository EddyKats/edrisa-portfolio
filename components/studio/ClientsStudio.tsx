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
    <div className="grid max-w-2xl gap-6">
      {clients.length === 0 ? <p className="text-sm text-[#1c120e]/60">No clients yet. Add one when you have a real name and logo.</p> : null}
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
    <div className="grid gap-3 rounded-2xl border border-[#1c120e]/10 p-4">
      <div className="flex items-center justify-between">
        {client ? <PublishBadge published={client.published} /> : <p className="text-sm font-semibold">New client</p>}
        {client ? <OrderButtons action={(direction) => reorderClient(client.id, direction)} /> : null}
      </div>
      <form action={action} className="grid gap-3">
        {client ? <input type="hidden" name="id" value={client.id} /> : null}
        <Status state={state} />
        <label className="grid gap-1 text-sm font-medium">
          Name
          <input name="name" defaultValue={client?.name ?? ""} className={controlClass} />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Website
          <input name="website" defaultValue={client?.website ?? ""} placeholder="https://" className={controlClass} />
        </label>
        <label className="flex items-center gap-2 text-sm">
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
            <SaveButton label="Delete" />
          </form>
        </>
      ) : null}
    </div>
  );
}
