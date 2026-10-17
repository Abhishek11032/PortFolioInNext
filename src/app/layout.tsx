import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Abhishek Tiwari | Full-Stack Developer',
	description:
		'Portfolio of Abhishek Tiwari, a full-stack developer working with React, Next.js, Python, Django, and relational databases.',
	openGraph: {
		title: 'Abhishek Tiwari | Full-Stack Developer',
		description:
			'Full-stack developer portfolio featuring work across React, Next.js, Python, Django, and data-driven applications.',
		type: 'website',
	},
	twitter: {
		card: 'summary',
		title: 'Abhishek Tiwari | Full-Stack Developer',
		description:
			'Full-stack developer portfolio featuring work across React, Next.js, Python, Django, and data-driven applications.',
	},
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Keep stylesheet loading because next/font requires network access during builds in this environment. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet' />
      </head>
      <body>{children}</body>
    </html>
  );
}
