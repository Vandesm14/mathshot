import Head from 'next/head';

import TabBar from './components/TabBar';

import './index.css';

export default function Home() {
  return (
    <>
      <Head>
        <title>Mathshot</title>
        <meta
          name="description"
          content="Math is hard. Let AI do the work for you!"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center">
        <TabBar />
      </main>
    </>
  );
}
