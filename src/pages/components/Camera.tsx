import React from 'react';

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

  React.useEffect(() => {
    // access video stream from webcam
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: false,
      })
      // on success, stream it in video tag
      .then(function (stream) {
        if (video.current instanceof HTMLVideoElement && stream) {
          video.current.srcObject = stream;
          video.current.play();
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

        setData(canvas.current.toDataURL('image/png'));
        console.log('dev: picture');
      } else {
        clearphoto();
      }
    }
  }

  function onClick(ev: React.MouseEvent<HTMLButtonElement>) {
    takepicture();
    ev.preventDefault();
  }

  function clearphoto() {
    if (
      canvas.current instanceof HTMLCanvasElement &&
      photo.current instanceof HTMLImageElement
    ) {
      const context = canvas.current.getContext('2d')!;
      context.fillStyle = '#AAA';
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
        <button id="startbutton" onClick={onClick}>
          Take photo
        </button>
      </div>

      <canvas id="canvas" ref={canvas} width={width} height={height}></canvas>
      <div className="output">
        <img
          id="photo"
          alt="The screen capture will appear in this box."
          ref={photo}
          src={data}
          width={width}
          height={height}
        />
      </div>
    </div>
  );
}
