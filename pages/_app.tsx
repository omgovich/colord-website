import "@radix-ui/colors/pink.css";
import '../styles/globals.css'
import { IdProvider } from '@radix-ui/react-id';
import type { AppProps } from 'next/app'

export default function Application({ Component, pageProps }: AppProps) {
  return (
    <IdProvider>
      <Component {...pageProps} />
    </IdProvider>
  )
}
