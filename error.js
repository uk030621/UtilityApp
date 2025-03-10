"use client";

export default function ErrorPage({ error, reset }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white px-6 text-center">
      <h1 className="text-4xl md:text-6xl font-bold">
        Something went wrong 😢
      </h1>
      <p className="mt-4 text-lg md:text-xl">
        {error?.message || "An unexpected error occurred. Please try again."}
      </p>

      <div className="mt-6 flex flex-col md:flex-row gap-4">
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 text-lg md:text-xl"
        >
          Try Again
        </button>

        <a
          href="/"
          className="px-6 py-3 border border-white text-white rounded-lg hover:bg-white hover:text-gray-900 transition duration-300 text-lg md:text-xl"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}
