// Camera code from:
// https://srivastavayushmaan1347.medium.com/how-to-access-camera-and-capture-photos-using-javascript-80bf7b53b45d
// and
// https://www.studytonight.com/post/capture-photo-using-webcam-in-javascript

import React from 'react';
import './Camera.css';
import { api } from '~/utils/api';

const dbg = (a: any) => {
  console.trace('dev:', a);
  return a;
};

export default function Camera({}) {
  const video = React.createRef<HTMLVideoElement>();
  const canvas = React.createRef<HTMLCanvasElement>();
  const photo = React.createRef<HTMLImageElement>();

  const [streaming, setStreaming] = React.useState(false);
  const [data, setData] = React.useState('');
  const [width, setWidth] = React.useState(0);
  const [height, setHeight] = React.useState(0);

  const req = api.post.ask.useMutation();

  React.useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: false,
      })
      .then(function (stream) {
        if (video.current instanceof HTMLVideoElement && stream) {
          try {
            video.current.srcObject = stream;
            video.current
              .play()
              .then(() => {
                console.log('play');
              })
              .catch((e) => {
                // Catching this for now
                console.error('play error:', e);
              });
          } catch (e) {
            // Catching this for now
            console.error('An error occurred: ' + e);
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
      photo.current instanceof HTMLImageElement &&
      video.current instanceof HTMLVideoElement
    ) {
      setWidth(video.current.videoWidth);
      setHeight(video.current.videoHeight);

      var context = canvas.current.getContext('2d');
      if (context) {
        context.drawImage(
          video.current,
          0,
          0,
          canvas.current.width,
          canvas.current.height,
        );

        const data = dbg(canvas.current.toDataURL('image/png'));
        setData(data);

        if (data !== 'data:.' && data.startsWith('data:')) {
          req.mutate({ image: data });
        }
      } else {
        clearphoto();
      }
    }
  }

  function onClick(ev: React.MouseEvent<HTMLButtonElement>) {
    clearphoto();
    takepicture();
    ev.preventDefault();
  }

  function clearphoto() {
    if (
      canvas.current instanceof HTMLCanvasElement &&
      photo.current instanceof HTMLImageElement
    ) {
      const context = canvas.current.getContext('2d')!;
      context.fillStyle = '#f00';
      context.fillRect(0, 0, canvas.current.width, canvas.current.height);

      setData(canvas.current.toDataURL('image/png'));
    }
  }

  return (
    <div className="container flex flex-col items-center">
      <div className="camera border border-black">
        <video id="video" onCanPlay={canplay} ref={video}>
          Video stream not available.
        </video>
      </div>
      <div>
        <button id="startbutton" className="btn btn-blue" onClick={onClick}>
          Take photo
        </button>
      </div>

      <canvas id="canvas" ref={canvas} width={width} height={height}></canvas>
      <img
        id="photo"
        alt="The screen capture will appear in this box."
        ref={photo}
        src={data}
        width={width}
        height={height}
      />

      <div>
        <h2>Response</h2>
        <pre>
          {req.error
            ? JSON.stringify(req.error, null, 2)
            : JSON.stringify(req.data, null, 2)}
        </pre>
      </div>
    </div>
  );
}
