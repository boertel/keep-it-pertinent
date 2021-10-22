import Document, { Html, Head, Main, NextScript } from "next/document";
import { useEffect } from "react";

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html className="dark">
        <Head />
        <body className="dark:bg-black dark:text-white">
          <Main />
          <NextScript />
          <Version />
        </body>
      </Html>
    );
  }
}

function Version() {
  useEffect(() => {
    console.log(
      `${process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA} (${process.env.NEXT_PUBLIC_VERCEL_ENV})`
    );
  }, []);
  return null;
}

export default MyDocument;
