export function ContactFaq({
  heading,
  items,
}: {
  heading: string;
  items: readonly { question: string; answer: string }[];
}) {
  return (
    <section className="contact-faq" aria-labelledby="contact-faq-title">
      <h2 id="contact-faq-title" className="about-chapter-title">
        {heading}
      </h2>
      <ol className="contact-notes">
        {items.map((item, index) => (
          <li key={item.question} className="contact-note">
            <p className="contact-note-index" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </p>
            <h3>{item.question}</h3>
            <p>{item.answer}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
