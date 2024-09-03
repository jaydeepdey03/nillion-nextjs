//index.tsx

import * as React from "react";
import type {AppProps} from "next/app";
import "../styles/globals.css";
import {NillionProvider} from "@nillion/client-react-hooks";

export const config = {}

export default function App({Component, pageProps}: AppProps) {
  const network = process.env.NODE_ENV === "production" ? "photon" : "devnet"
  return (
    <NillionProvider network={network}>
      <Component {...pageProps} />
    </NillionProvider>
  );
}
