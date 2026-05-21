// src/components/TranscriptList.js
import React from "react";
import { IconButton } from "@mui/material";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import StopCircleIcon from "@mui/icons-material/StopCircle";

const TranscriptList = ({
  items,
  onItemClick,
  onStopClick,
  playingItemIndex,
}) => {
  const filteredItems = items.filter((item) => {
    return "input" in item; // 'input' プロパティがオブジェクトまたはそのプロトタイプチェーン上に存在するか
  });
  return (
    <ul style={{ listStyleType: "none", padding: 0 }}>
      {filteredItems &&
        filteredItems
          .filter((item) => item.input && item.end_time)
          .map((item, index) => {
            const isPlaying = index === playingItemIndex;

            return (
              // この li タグの中の要素の並びとスタイルを変更します
              <li
                key={item.question_id + index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "5px",
                  marginBottom: "10px",
                  gap: "16px", // 要素間のスペース
                }}
              >
                {/* 1. question_id */}
                <div
                  style={{
                    width: "120px",
                    fontWeight: "normal",
                    flexShrink: 0,
                  }}
                >
                  {item.question_id}
                </div>

                {/* 2. 再生/停止ボタン */}
                <IconButton
                  onClick={() =>
                    isPlaying ? onStopClick() : onItemClick(item, index)
                  }
                  color={isPlaying ? "secondary" : "primary"}
                  aria-label={isPlaying ? "stop" : "play"}
                  style={{ padding: 0 /* デフォルトの余白を削除 */ }}
                >
                  {isPlaying ? (
                    <StopCircleIcon sx={{ fontSize: 32 }} />
                  ) : (
                    <PlayCircleIcon sx={{ fontSize: 32 }} />
                  )}
                </IconButton>

                {/* 3. input (認識テキスト) */}
                <div style={{ flexGrow: 1 }}>{item.input}</div>
              </li>
            );
          })}
    </ul>
  );
};

export default TranscriptList;
