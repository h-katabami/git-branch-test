// 不要になった！！！
// // src/components/AudioPlayerWithTranscript.js
// import React, { useState, useRef } from "react";
// import Player from "./Player";
// import TranscriptList from "./TranscriptList";

// const AudioPlayerWithTranscript = ({ recording_url, inputs_point }) => {
//   const playerRef = useRef(null);
//   const [playing, setPlaying] = useState(false);
//   const [stopTime, setStopTime] = useState(null);

//   // 【追加】現在再生中のアイテムのIDを管理するstate
//   const [playingItemId, setPlayingItemId] = useState(null);
//   const playerUrl = Array.isArray(recording_url)
//     ? recording_url[0]
//     : recording_url;
//   // 再生ボタンがクリックされたときの処理
//   const handleTranscriptClick = (item) => {
//     console.log("start", item);
//     const startTime = parseFloat(item.start_time);
//     const endTime = parseFloat(item.end_time);

//     if (!isNaN(startTime) && !isNaN(endTime) && playerRef.current) {
//       playerRef.current.seekTo(startTime, "seconds");
//       setPlaying(true);
//       setStopTime(endTime);
//       // 【追加】クリックされたアイテムのIDをstateに保存
//       setPlayingItemId(item.question_id);
//     }
//   };

//   // 【追加】停止ボタンがクリックされたときの処理
//   const handleStopClick = () => {
//     setPlaying(false);
//     setPlayingItemId(null);
//     setStopTime(null); // stopTimeもリセット
//   };

//   // 再生時間が進んだときの処理
//   const handleProgress = (state) => {
//     if (stopTime !== null && state.playedSeconds >= stopTime) {
//       setPlaying(false);
//       setStopTime(null);
//       // 【追加】再生が完了したら、再生中IDをリセット
//       setPlayingItemId(null);
//     }
//   };

//   // プレーヤーのPauseボタンが押されたときの処理
//   const handlePause = () => {
//     setPlaying(false);
//     // 【追加】手動で停止した場合も、再生中IDをリセット
//     setPlayingItemId(null);
//   };

//   return (
//     <div>
//       {/* <h2>音声プレーヤー</h2> */}
//       {console.log("【親から渡すURL】:", recording_url)}
//       {console.log(playerUrl)}
//       <Player
//         ref={playerRef}
//         url={playerUrl}
//         playing={playing}
//         onProgress={handleProgress}
//         onPlay={() => setPlaying(true)}
//         onPause={handlePause} // 【変更点】handlePauseを渡す
//       />
//       <hr style={{ margin: "20px 0" }} />
//       {/* <h2>文字起こし</h2> */}
//       {/* 【変更点】TranscriptListに新しいpropsを渡す */}
//       <TranscriptList
//         items={inputs_point}
//         onItemClick={handleTranscriptClick}
//         onStopClick={handleStopClick}
//         playingItemId={playingItemId}
//       />
//     </div>
//   );
// };

// export default AudioPlayerWithTranscript;
