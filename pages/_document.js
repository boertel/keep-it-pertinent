import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    console.log(
      `${process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA} (${process.env.NEXT_PUBLIC_VERCEL_ENV})`
    );
    return (
      <Html className="dark">
        <Head />
        <body className="dark:bg-black dark:text-white">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
