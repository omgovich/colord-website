import Document, { Html, Head, Main, NextScript } from 'next/document'

export default class ApplicationDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link rel="icon" href="/favicon.ico" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Unica+One&family=Roboto+Mono&display=swap" rel="stylesheet" />
          <meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" name="viewport" />
          {/* OG image */}
          <meta property="og:image" content="https://colord.omgovich.ru/og.png" />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          {/* Twitter card */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="Colord" />
          <meta name="twitter:description" content="A tiny yet powerful JavaScript tool for high-performance color manipulations and conversions"/ >
          <meta name="twitter:image" content="https://colord.omgovich.ru/og.png" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}