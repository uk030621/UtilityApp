export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white px-6 text-center">
      <h1 className="text-6xl md:text-8xl font-bold">404</h1>
      <p className="mt-4 text-lg md:text-xl">
        Oops! The page you&apos;re looking for doesn&apos;t exist.
      </p>

      <a
        href="/"
        className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 text-lg md:text-xl"
      >
        Go Home
      </a>
    </div>
  );
}
