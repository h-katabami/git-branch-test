// src/hooks/useAudioTranscriptPlayer.js
import { useState, useRef } from "react";

// カスタムフックの命名規則は `use` で始める
export const useAudioTranscriptPlayer = () => {
  // これまでAudioPlayerWithTranscriptが持っていたstateとrefを全てここに移動
  const playerRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [stopTime, setStopTime] = useState(null);
  const [playingItemIndex, setPlayingItemIndex] = useState(null);

  // 全てのイベントハンドラもここに移動
  const handleTranscriptClick = (item, index) => {
    const startTime = parseFloat(item.start_time);
    const endTime = parseFloat(item.end_time);

    if (!isNaN(startTime) && !isNaN(endTime) && playerRef.current) {
      playerRef.current.seekTo(startTime, "seconds");
      setPlaying(true);
      setStopTime(endTime);
      setPlayingItemIndex(index);
    }
  };

  const handleStopClick = () => {
    setPlaying(false);
    setPlayingItemIndex(null);
    setStopTime(null);
  };

  const handleProgress = (state) => {
    if (stopTime !== null && state.playedSeconds >= stopTime) {
      setPlaying(false);
      setStopTime(null);
      setPlayingItemIndex(null);
    }
  };

  const handlePause = () => {
    setPlaying(false);
    setPlayingItemIndex(null);
  };

  const handlePlay = () => {
    setPlaying(true);
  };

  // このフックを利用するコンポーネントが必要とする値や関数をオブジェクトとして返す
  return {
    playerRef,
    playing,
    playingItemIndex,
    handleTranscriptClick,
    handleStopClick,
    handleProgress,
    handlePlay,
    handlePause,
  };
};
