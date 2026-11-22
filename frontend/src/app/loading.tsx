export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[70vh] items-center justify-center bg-ivory px-6 py-20 text-brown-light dark:bg-brown dark:text-white/70"
    >
      Loading page content…
    </div>
  );
}