export const metadata = {
  title: 'CircleMatch - 台灣教師調動配對系統',
  description: '幫助台灣教師尋找雙向、三角或多角調動機會的配對平台',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body style={{ 
        margin: 0, 
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        backgroundColor: "#f5f5f5",
        color: "#333"
      }}>
        {children}
      </body>
    </html>
  )
}