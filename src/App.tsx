import React, { useEffect, useState } from "react";
import "./App.css";
import StreamHolder from "./components/StreamHolder/StreamHolder";
import { Grid } from "@mui/material";

function App() {
  const [stream, setStream] = useState<MediaStream>();

  const startButton = () => {
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then((stream) => {
        console.log("the stream", stream);
        setStream(stream);
      });
  };

  return (
    <div>
      <button onClick={startButton}>Load</button>
      <Grid container>
        <button>start</button> <div>roomID</div>
      </Grid>
      <Grid container>
        <input></input>
        <button>join</button>
      </Grid>
      <Grid container>
        <Grid item>
          {stream && <StreamHolder title={"Local"} stream={stream} />}
        </Grid>
        <Grid item>
          {stream && <StreamHolder title={"Remote"} stream={stream} />}
        </Grid>
      </Grid>
    </div>
  );
}

export default App;
