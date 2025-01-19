import React from 'react';
import './Loader.css';

export default function Loader({ endAt }: { endAt: number }) {
  const [loading, setLoading] = React.useState(true);

  const [percent, setPercent] = React.useState(0);

  React.useEffect(() => {
    const now = Date.now();
    if (now > endAt) {
      setLoading(false);
    } else {
      setLoading(true);
    }
  });

  React.useEffect(() => {
    setLoading(false);

    let start = Date.now();
    const i = setInterval(() => {
      const now = Date.now();
      const percent = ((now - start) / (endAt - start)) * 100;
      setPercent(percent);

      if (now > endAt) {
        clearInterval(i);
        setLoading(false);
      }
    }, 1000 / 30);

    return () => {
      clearInterval(i);
    };
  }, [endAt]);

  return (
    <div className="loader">
      {loading ? (
        <div>
          <div className="bar">
            <div
              className="progress"
              style={{
                width: `${percent}%`,
              }}
            ></div>
          </div>
          <div className="text">{Math.round(percent)}%</div>
        </div>
      ) : (
        <div className="text">Waiting...</div>
      )}
    </div>
  );
}
