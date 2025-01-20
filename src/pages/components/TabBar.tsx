import React from 'react';

import Camera, { OnCapture } from './Camera';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { api } from '~/utils/api';
import Loader from './Loader';

export default function TabBar({}) {
  const [index, setIndex] = React.useState(0);

  const [image, setImage] = React.useState<string | null>(null);
  const [width, setWidth] = React.useState<number | null>(null);
  const [height, setHeight] = React.useState<number | null>(null);

  const [endAt, setEndAt] = React.useState(0);
  const [showTimer, setShowTimer] = React.useState(false);

  const req = api.post.ask.useMutation();

  function onCapture(d: OnCapture) {
    setImage(d.image);
    setWidth(d.width);
    setHeight(d.height);

    setIndex(1);
  }

  function onCancel() {
    setImage(null);
    setWidth(null);
    setHeight(null);

    setIndex(0);
  }

  function onConfirm() {
    setIndex(2);

    if (image) {
      req.mutate({ image });
      setEndAt(Date.now() + 1000 * 10);
    }
  }

  const result = React.useMemo(() => {
    console.log('rerender');
    if (req.isPending) {
      setShowTimer(true);
      return 'Loading...';
    } else if (req.error) {
      setShowTimer(false);
      return `Error: ${JSON.stringify(req.error, null, 2)}`;
    } else if (req.data) {
      setShowTimer(false);
      return <Markdown remarkPlugins={[remarkGfm]}>{req.data}</Markdown>;
    }

    return 'Take a photo to get started.';
  }, [req.isPending, req.error, req.data]);

  return (
    <Tabs selectedIndex={index} onSelect={(i) => setIndex(i)}>
      <TabList>
        <Tab>Camera</Tab>
        <Tab>Picture</Tab>
        <Tab>Result</Tab>
      </TabList>

      <TabPanel>
        <Camera onCapture={onCapture} />
      </TabPanel>
      <TabPanel>
        {image && width && height ? (
          <>
            <img
              id="photo"
              alt="The screen capture will appear in this box."
              src={image}
              width={width}
              height={height}
            />
            <div className="flex justify-center gap-2 py-2">
              <button className="btn btn-red" onClick={onCancel}>
                Retake
              </button>
              <button className="btn btn-blue" onClick={onConfirm}>
                Confirm
              </button>
            </div>
          </>
        ) : null}
      </TabPanel>
      <TabPanel>
        {showTimer ? (
          <Loader endAt={endAt} />
        ) : (
          <div className="flex flex-col items-center">
            {image && width && height ? (
              <img
                id="photo"
                alt="The screen capture will appear in this box."
                src={image}
                width={width}
                height={height}
              />
            ) : null}
            {result}
            <div className="py-5">
              <button className="btn btn-blue" onClick={() => setIndex(0)}>
                Try another
              </button>
            </div>
          </div>
        )}
      </TabPanel>
    </Tabs>
  );
}
