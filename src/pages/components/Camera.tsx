// Camera code from:
// https://srivastavayushmaan1347.medium.com/how-to-access-camera-and-capture-photos-using-javascript-80bf7b53b45d
// and
// https://www.studytonight.com/post/capture-photo-using-webcam-in-javascript

import React from 'react';
import './Camera.css';

export type OnCapture = {
  image: string;
  width: number;
  height: number;
};

export default function Camera({
  onCapture,
}: {
  onCapture?: (d: OnCapture) => void;
}) {
  const video = React.createRef<HTMLVideoElement>();
  const canvas = React.createRef<HTMLCanvasElement>();

  const [streaming, setStreaming] = React.useState(false);
  const [width, setWidth] = React.useState(0);
  const [height, setHeight] = React.useState(0);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: 'environment' },
      })
      .then(function (stream) {
        if (video.current instanceof HTMLVideoElement && stream) {
          try {
            video.current.srcObject = stream;
            video.current
              .play()
              .then(() => {
                if (video.current instanceof HTMLVideoElement) {
                  setWidth(video.current.videoWidth);
                  setHeight(video.current.videoHeight);
                }
              })
              .catch((e) => {
                // Catching this for now
                console.error('play error:', e);
              });
          } catch (e) {
            // Catching this for now
            console.error('An error occurred: ', e);
          }
        }
      })
      .catch(function (err) {
        console.log('An error occurred: ' + err);
      });
  }, []);

  function canplay() {
    if (
      video.current instanceof HTMLVideoElement &&
      canvas.current instanceof HTMLCanvasElement &&
      !streaming
    ) {
      setStreaming(true);
    }
  }

  function takepicture() {
    if (
      canvas.current instanceof HTMLCanvasElement &&
      video.current instanceof HTMLVideoElement
    ) {
      const context = canvas.current.getContext('2d');
      if (context) {
        context.drawImage(
          video.current,
          0,
          0,
          canvas.current.width,
          canvas.current.height,
        );

        const image = canvas.current.toDataURL('image/png');
        if (onCapture) {
          onCapture({ image, width, height });
        }
      }
    }
  }

  function onClick(ev: React.MouseEvent<HTMLButtonElement>) {
    takepicture();
    ev.preventDefault();
  }

  return (
    <div className="container flex flex-col items-center">
      <div className="camera border border-black">
        <video id="video" onCanPlay={canplay} ref={video}>
          Video stream not available.
        </video>
      </div>
      <div className="flex justify-center gap-2 py-2">
        <button id="startbutton" className="btn btn-blue" onClick={onClick}>
          Take photo
        </button>
      </div>

      <canvas id="canvas" ref={canvas} width={width} height={height}></canvas>
    </div>
  );
}
