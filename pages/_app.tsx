import '../styles/globals.css'
import Head from 'next/head'
import type { AppProps } from 'next/app'
import { IdProvider } from '@radix-ui/react-id';

export default function Application({ Component, pageProps }: AppProps) {
  return (
    <IdProvider>
      <Head>
        <meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" name="viewport" />
      </Head>
      <Component {...pageProps} />
    </IdProvider>
  )
}
