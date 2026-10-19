export default function Loading() {
  return (
    <div className="site-route-loader" role="status">
      <span className="sr-only">Loading</span>
      <div className="loader" aria-hidden="true" />
    </div>
  );
}
