export const metadata = {
  title: "Frank's Restaurant - Admin",
  description: 'Admin interface for managing daily specials',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
