export function ContactFaq({
  heading,
  items,
}: {
  heading: string;
  items: readonly { question: string; answer: string }[];
}) {
  return (
    <section className="contact-faq mt-16" aria-labelledby="contact-faq-title">
      <h2 id="contact-faq-title" className="about-chapter-title">
        {heading}
      </h2>
      <dl className="mt-8 grid gap-8">
        {items.map((item) => (
          <div key={item.question}>
            <dt className="text-lg font-semibold tracking-tight">{item.question}</dt>
            <dd className="about-support mt-2 max-w-[36rem]">{item.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
