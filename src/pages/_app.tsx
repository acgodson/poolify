import '@/styles/index.css'
import 'next/font/google'
import type { AppProps } from 'next/app'
import { ThemeConfig, ChakraProvider } from '@chakra-ui/react';
import Layout from '@/Components/Layout';
import { GlobalContextProvider } from '@/contexts/global';

export default function App({ Component, pageProps }: AppProps) {



  return (
    <GlobalContextProvider>
      <ChakraProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ChakraProvider>
    </GlobalContextProvider>
  );
}
