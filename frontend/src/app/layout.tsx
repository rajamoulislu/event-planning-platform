// src/app/layout.tsx
import './globals.css'

export const metadata = {
  title: 'Event Management App',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}