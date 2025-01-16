import React from 'react';

export default function Camera({}) {
  const video = React.createRef<HTMLVideoElement>();
  const canvas = React.createRef<HTMLCanvasElement>();
  const photo = React.createRef<HTMLImageElement>();

  const [width, setWidth] = React.useState(320);
  const [height, setHeight] = React.useState(0);
  const [streaming, setStreaming] = React.useState(false);

  React.useEffect(() => {
    // access video stream from webcam
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: false,
      })
      // on success, stream it in video tag
      .then(function (stream) {
        if (video instanceof HTMLVideoElement) {
          video.srcObject = stream;
          video.play();
        }
      })
      .catch(function (err) {
        console.log('An error occurred: ' + err);
      });
  }, []);

  function canplay(ev: React.SyntheticEvent<HTMLVideoElement>) {
    if (!streaming) {
      // @ts-expect-error: TODO: maybe it doesn't exist?
      setHeight(video.videoHeight / (video.videoWidth / width));

      if (isNaN(height)) {
        setHeight(width / (4 / 3));
      }

      // @ts-expect-error: TODO: maybe it doesn't exist?
      video.setAttribute('width', width);
      // @ts-expect-error: TODO: maybe it doesn't exist?
      video.setAttribute('height', height);
      // @ts-expect-error: TODO: maybe it doesn't exist?
      canvas.setAttribute('width', width);
      // @ts-expect-error: TODO: maybe it doesn't exist?
      canvas.setAttribute('height', height);
      setStreaming(true);
    }
  }

  function takepicture() {
    if (
      canvas instanceof HTMLCanvasElement &&
      photo instanceof HTMLImageElement
    ) {
      var context = canvas.getContext('2d');
      if (context && width && height) {
        canvas.width = width;
        canvas.height = height;
        // @ts-expect-error: TODO: this should work
        context.drawImage(video, 0, 0, width, height);

        var data = canvas.toDataURL('image/png');
        photo.setAttribute('src', data);
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
      canvas instanceof HTMLCanvasElement &&
      photo instanceof HTMLImageElement
    ) {
      const context = canvas.getContext('2d')!;
      context.fillStyle = '#AAA';
      context.fillRect(0, 0, canvas.width, canvas.height);

      const data = canvas.toDataURL('image/png');
      photo.setAttribute('src', data);
    }
  }

  return (
    <div className="container flex flex-col items-center">
      <div className="camera border border-black">
        <video id="video" onCanPlay={canplay}>
          Video stream not available.
        </video>
      </div>
      <div>
        <button id="startbutton" onClick={onClick}>
          Take photo
        </button>
      </div>

      <canvas id="canvas"></canvas>
      <div className="output">
        <img id="photo" alt="The screen capture will appear in this box." />
      </div>
    </div>
  );
}
