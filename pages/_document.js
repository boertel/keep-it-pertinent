import Document, { Html, Head, Main, NextScript } from "next/document";
import Link from "next/link";

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
        </body>
      </Html>
    );
  }
}

export default MyDocument;
