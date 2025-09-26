import Link from 'next/link';

export default function BackToHomeButton() {
  return (
    <Link
      href="/"
      className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-6"
    >
      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      ホームへ戻る
    </Link>
  );
}