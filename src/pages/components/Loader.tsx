import React from 'react';

export default function Loader({ endAt }: { endAt: number }) {
  const [time, setTime] = React.useState(Date.now());
  const [start, setStart] = React.useState(Date.now());
  const [loading, setLoading] = React.useState(true);

  const [percent, setPercent] = React.useState(0);

  React.useEffect(() => {
    setStart(Date.now());
    setLoading(false);
  }, [endAt]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setTime(Date.now());
      setPercent(((time - start) / (endAt - start)) * 100);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  React.useEffect(() => {
    if (time > endAt) {
      setLoading(false);
    }
  }, [time, endAt]);

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
        <div className="text">Done!</div>
      )}
    </div>
  );
}
