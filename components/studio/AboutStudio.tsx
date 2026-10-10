"use client";

import { useActionState } from "react";
import {
  confirmAboutFeature,
  confirmExperienceImage,
  removeAboutFeature,
  removeExperience,
  removeExperienceImage,
  removeStat,
  reorderExperience,
  reorderStat,
  saveAbout,
  saveExperienceRecord,
  saveStat,
} from "@/app/studio/(app)/about/actions";
import { ImageField, OrderButtons, PublishBadge, SaveButton, Status, controlClass } from "@/components/studio/editor";

type Stat = { id: string; value: string; label: string; icon: string; published: boolean };
type Entry = {
  id: string;
  company: string;
  role: string;
  microcopy: string;
  imageUrl: string | null;
  startDate: string;
  endDate: string;
  published: boolean;
};

export function AboutStudio({
  content,
  stats,
  experience,
}: {
  content: {
    pageTitle: string;
    introHeading: string;
    introParagraph: string;
    storyHeading: string;
    storyBody: string;
    featureMediaUrl: string | null;
    seoTitle: string;
    seoDescription: string;
    ctaHeading: string;
    ctaText: string;
    ctaButtonLabel: string;
    ctaButtonHref: string;
  };
  stats: Stat[];
  experience: Entry[];
}) {
  const [state, action] = useActionState(saveAbout, {});

  return (
    <div className="grid max-w-2xl gap-10">
      <form action={action} className="grid gap-5">
        <Status state={state} />
        <fieldset className="grid gap-4">
          <legend className="text-sm font-semibold">Basic information</legend>
          <Label name="pageTitle" label="Page title" defaultValue={content.pageTitle} />
          <Label name="introHeading" label="Intro heading" defaultValue={content.introHeading} />
          <Area name="introParagraph" label="Intro" defaultValue={content.introParagraph} />
          <Label name="storyHeading" label="Story heading" defaultValue={content.storyHeading} />
          <Area name="storyBody" label="Story" defaultValue={content.storyBody} />
        </fieldset>
        <fieldset className="grid gap-4 border-t border-[#1c120e]/10 pt-5">
          <legend className="text-sm font-semibold">Call to action</legend>
          <Label name="ctaHeading" label="Heading" defaultValue={content.ctaHeading} />
          <Area name="ctaText" label="Body" defaultValue={content.ctaText} />
          <Label name="ctaButtonLabel" label="Button label" defaultValue={content.ctaButtonLabel} />
          <Label name="ctaButtonHref" label="Button link" defaultValue={content.ctaButtonHref} />
        </fieldset>
        <fieldset className="grid gap-4 border-t border-[#1c120e]/10 pt-5">
          <legend className="text-sm font-semibold">SEO</legend>
          <Label name="seoTitle" label="SEO title" defaultValue={content.seoTitle} />
          <Area name="seoDescription" label="SEO description" defaultValue={content.seoDescription} />
        </fieldset>
        <SaveButton />
      </form>

      <section className="grid gap-4 border-t border-[#1c120e]/10 pt-8">
        <h2 className="text-lg font-semibold">Feature media</h2>
        <ImageField
          label="Feature image"
          url={content.featureMediaUrl}
          scope="about-feature"
          ownerId="about"
          confirm={confirmAboutFeature}
          remove={removeAboutFeature}
        />
      </section>

      <section className="grid gap-6 border-t border-[#1c120e]/10 pt-8">
        <h2 className="text-lg font-semibold">Stats</h2>
        {stats.length === 0 ? <p className="text-sm text-[#1c120e]/60">No stats yet.</p> : null}
        {stats.map((stat) => (
          <StatForm key={stat.id} stat={stat} />
        ))}
        <StatForm />
      </section>

      <section className="grid gap-6 border-t border-[#1c120e]/10 pt-8">
        <h2 className="text-lg font-semibold">Experience</h2>
        {experience.length === 0 ? <p className="text-sm text-[#1c120e]/60">No experience yet.</p> : null}
        {experience.map((entry) => (
          <ExperienceForm key={entry.id} entry={entry} />
        ))}
        <ExperienceForm />
      </section>
    </div>
  );
}

function StatForm({ stat }: { stat?: Stat }) {
  const [state, action] = useActionState(saveStat, {});
  const [removeState, removeAction] = useActionState(removeStat, {});

  return (
    <div className="grid gap-3 rounded-2xl border border-[#1c120e]/10 p-4">
      <div className="flex items-center justify-between gap-3">
        {stat ? <PublishBadge published={stat.published} /> : <p className="text-sm font-semibold">New stat</p>}
        {stat ? <OrderButtons action={(direction) => reorderStat(stat.id, direction)} /> : null}
      </div>
      <form action={action} className="grid gap-3">
        {stat ? <input type="hidden" name="id" value={stat.id} /> : null}
        <Status state={state} />
        <Label name="value" label="Value" defaultValue={stat?.value ?? ""} />
        <Label name="label" label="Label" defaultValue={stat?.label ?? ""} />
        <label className="grid gap-1 text-sm font-medium">
          Icon
          <select name="icon" defaultValue={stat?.icon ?? "layers"} className={controlClass}>
            <option value="layers">Layers</option>
            <option value="sparkles">Sparkles</option>
            <option value="clock">Clock</option>
          </select>
        </label>
        <Check published={stat?.published ?? false} />
        <SaveButton label={stat ? "Save stat" : "Add stat"} />
      </form>
      {stat ? (
        <form action={removeAction} className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="id" value={stat.id} />
          <Status state={removeState} />
          <input name="confirm" placeholder="Type delete" className={controlClass} />
          <SaveButton label="Delete" />
        </form>
      ) : null}
    </div>
  );
}

function ExperienceForm({ entry }: { entry?: Entry }) {
  const [state, action] = useActionState(saveExperienceRecord, {});
  const [removeState, removeAction] = useActionState(removeExperience, {});

  return (
    <div className="grid gap-3 rounded-2xl border border-[#1c120e]/10 p-4">
      <div className="flex items-center justify-between gap-3">
        {entry ? <PublishBadge published={entry.published} /> : <p className="text-sm font-semibold">New experience</p>}
        {entry ? <OrderButtons action={(direction) => reorderExperience(entry.id, direction)} /> : null}
      </div>
      <form action={action} className="grid gap-3">
        {entry ? <input type="hidden" name="id" value={entry.id} /> : null}
        <Status state={state} />
        <Label name="company" label="Company" defaultValue={entry?.company ?? ""} />
        <Label name="role" label="Role" defaultValue={entry?.role ?? ""} />
        <Area name="microcopy" label="Microcopy" defaultValue={entry?.microcopy ?? ""} />
        <Label name="startDate" label="Start" type="date" defaultValue={entry?.startDate ?? ""} />
        <Label name="endDate" label="End" type="date" defaultValue={entry?.endDate ?? ""} />
        <Check published={entry?.published ?? false} />
        <SaveButton label={entry ? "Save experience" : "Add experience"} />
      </form>
      {entry ? (
        <>
          <ImageField
            label="Mark"
            url={entry.imageUrl}
            scope="experience"
            ownerId={entry.id}
            confirm={(key) => confirmExperienceImage(entry.id, key)}
            remove={() => removeExperienceImage(entry.id)}
          />
          <form action={removeAction} className="flex flex-wrap items-center gap-2">
            <input type="hidden" name="id" value={entry.id} />
            <Status state={removeState} />
            <input name="confirm" placeholder="Type delete" className={controlClass} />
            <SaveButton label="Delete" />
          </form>
        </>
      ) : null}
    </div>
  );
}

function Label({
  name,
  label,
  defaultValue,
  type = "text",
}: {
  name: string;
  label: string;
  defaultValue: string;
  type?: string;
}) {
  return (
    <label className="grid gap-1 text-sm font-medium">
      {label}
      <input name={name} type={type} defaultValue={defaultValue} className={controlClass} />
    </label>
  );
}

function Area({ name, label, defaultValue }: { name: string; label: string; defaultValue: string }) {
  return (
    <label className="grid gap-1 text-sm font-medium">
      {label}
      <textarea name={name} defaultValue={defaultValue} rows={4} className={controlClass} />
    </label>
  );
}

function Check({ published }: { published: boolean }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" name="published" defaultChecked={published} />
      Published
    </label>
  );
}
