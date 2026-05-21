// import React from "react";
// import ReactPlayer from "react-player";

// const Player = (props) => {
//   const url = props.url;
//   return url.length ? (
//     <ReactPlayer
//       url={url}
//       width="272px"
//       height="37px"
//       playing={false}
//       controls={true}
//       style={{ padding: "0 2" }}
//     />
//   ) : (
//     <></>
//   );
// };

// export default Player;

// import React from "react";
// import ReactPlayer from "react-player";
// import Typography from "@mui/material/Typography";

// const Player = (url) => {
//   if (!url.url || url.url.length === 0 || url.url[0] === "undefined") {
//     return <Typography />;
//   }
//   return (
//     <ReactPlayer
//       url={url.url}
//       width="272px"
//       height="37px"
//       playing={false}
//       controls={true}
//       style={{ padding: "0 2", marginBottom: "5px" }}
//     />
//   );
// };

// export default Player;

import React, { forwardRef } from "react";
import ReactPlayer from "react-player";

// コンポーネントを forwardRef((props, ref) => { ... }) の形で定義します
const Player = forwardRef(
  ({ url, playing, onProgress, onPlay, onPause }, ref) => {
    // console.log("【子が受け取ったURL】:", url);
    // console.log(url);
    return (
      <ReactPlayer
        // 親から受け取った ref を、ReactPlayer コンポーネントに渡します
        ref={ref}
        url={url}
        playing={playing}
        controls={true}
        onProgress={onProgress}
        onPlay={onPlay}
        onPause={onPause}
        width="100%"
        height="50px"
      />
    );
  }
);

export default Player;
