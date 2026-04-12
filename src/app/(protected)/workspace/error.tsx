'use client';
export default function ErrorBoundary({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="p-8 text-black bg-white w-full h-full">
      <h1 className="text-3xl font-bold text-red-600">Runtime Error!</h1>
      <pre className="mt-4 p-4 bg-red-50 text-red-900 rounded overflow-auto border border-red-200">
        {error.message}
        {"\n\n"}
        {error.stack}
      </pre>
      <button onClick={reset} className="mt-4 bg-red-600 text-white px-4 py-2 rounded">Retry</button>
    </div>
  );
}
