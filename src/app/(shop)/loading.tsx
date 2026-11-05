/** Skeleton shown instantly during server navigation. */
export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-4 pt-8 md:px-8 md:pt-12" aria-busy="true" aria-label="Įkeliama">
      <div className="h-7 w-56 rounded-full bg-canvas" />
      <div className="mt-3 h-4 w-80 max-w-full rounded-full bg-canvas" />
      <ul className="mt-10 grid grid-cols-2 gap-x-3 gap-y-9 sm:grid-cols-3 md:gap-x-5 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <li key={i}>
            <div className="aspect-square rounded-2xl bg-canvas" />
            <div className="mt-3 h-3 w-full rounded-full bg-canvas" />
            <div className="mt-2 h-3 w-2/3 rounded-full bg-canvas" />
            <div className="mt-4 h-9 rounded-full bg-canvas" />
          </li>
        ))}
      </ul>
    </div>
  );
}
