import ClientLayout from "./ClientLayout";

export const metadata = {
  title: "HROne",
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#2D2D2D"/><text x="16" y="22" font-size="20" font-family="Arial" text-anchor="middle" fill="white">H</text></svg>',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <ClientLayout>{children}</ClientLayout>
    </html>
  );
}
