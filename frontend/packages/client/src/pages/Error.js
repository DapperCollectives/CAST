export default function Error({ resetErrorBoundary }) {
  return (
    <section className="section is-flex is-flex-direction-column full-height is-align-items-center is-justify-content-center">
      <p className="has-text-grey my-3">We're sorry, something went wrong...</p>
      <button
        className="button is-light rounded-sm"
        onClick={() => resetErrorBoundary()}
      >
        Reload Page
      </button>
    </section>
  );
}
