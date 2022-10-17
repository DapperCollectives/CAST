export default function SectionContainer({ classNames = '', children }) {
  return (
    <section className={`section ${classNames}`}>
      <div className="container">{children}</div>
    </section>
  );
}
