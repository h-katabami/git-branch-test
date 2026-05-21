import React, { useState, useEffect, useCallback, useRef } from "react";
import { styled } from "@mui/material/styles";

import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import Typography from "@mui/material/Typography";
import { Scrollbars } from "react-custom-scrollbars";

import { useAudioTranscriptPlayer } from "../hooks/useAudioTranscriptPlayer";
import Player from "./Player";
import TranscriptList from "./TranscriptList";
// import TranscriptList from "./TranscriptList";
// import Player from "./Player";
// import { useAuth } from "../hooks/use-auth";
import useApi from "../hooks/useApi"; // カスタムフック

// スタイル定義
const LogsDetailContainer = styled(Container)(({ theme }) => ({
  // height: 630,
  padding: theme.spacing(5),
  paddingTop: theme.spacing(2),
}));

const DetailPaper = styled(Paper)(({ theme }) => ({
  margin: theme.spacing(0.25),
  padding: theme.spacing(1),
}));

const DetailHeaderPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: "#EFEFEF",
  marginLeft: theme.spacing(0.25),
  marginRight: theme.spacing(0.25),
  padding: theme.spacing(1),
}));

const DetailTitleTypography = styled(Typography)(({ theme }) => ({
  marginLeft: theme.spacing(1),
}));

const InputGrid = styled(Grid)(({ theme }) => ({
  height: 84,
}));

const ScrollableList = styled(List)(({ theme }) => ({
  height: 185,
  overscrollBehavior: "scroll",
}));

// コンポーネント分割 (提案)
const CallDetailItem = ({ label, value }) => (
  <Grid item container wrap="nowrap" spacing={2}>
    <Grid item xs={3}>
      <ListItem style={{ paddingTop: 2, paddingBottom: 2 }}>
        <ListItemText primary={label} />
      </ListItem>
    </Grid>
    <Divider orientation="vertical" flexItem />
    <Grid item xs>
      <ListItem style={{ paddingTop: 2, paddingBottom: 2 }}>
        <ListItemText primary={value} />
      </ListItem>
    </Grid>
  </Grid>
);

export default function LogsDetail({
  callSid,
  open,
  editMode,
  onEditMode,
  onClose,
  onReload,
}) {
  // const auth = useAuth();
  // const { user } = auth;
  const [data, setData] = useState({ transcriptions: [] });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const api = useApi();

  // ★作成したカスタムフックを呼び出し、ロジックと状態を受け取る
  const {
    playerRef,
    playing,
    playingItemIndex,
    handleTranscriptClick,
    handleStopClick,
    handleProgress,
    handlePlay,
    handlePause,
  } = useAudioTranscriptPlayer();
  // playerに渡すURLを準備する処理 (以前のコードから)
  const playerUrl =
    data.recording_url && Array.isArray(data.recording_url)
      ? data.recording_url[0]
      : data.recording_url;
  // console.log(playerUrl);

  const fetchLogDetail = useCallback(
    async (callSid) => {
      console.log("fetchLogDetail called with callSid:", callSid); // ログ出力
      setLoading(true);
      setError(null);

      try {
        const response = await api.get(`/edit/histories/${callSid}`);
        // const response = "";
        const logData = response.duration
          ? response
          : {
              call_from: "",
              call_sid: "",
              company: "",
              duration: "",
              memo: "",
              recording_url: [],
              start_time: "",
              status: "",
              user_inputs: [
                {
                  question: "",
                  input: "",
                  created_time: "",
                },
              ],
            };
        setData(logData);
        setStatus(logData.status);
      } catch (err) {
        console.error(err);
        setError("データの取得に失敗しました");
        setData({ transcriptions: [] }); // 初期化
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  const updateLogDetail = useCallback(
    async (callSid, memo) => {
      console.log("updateLogDetail called with:", callSid, memo);

      setLoading(true);
      setError(null);

      try {
        await api.put(`/edit/histories/${callSid}`, {
          memo,
        });
        onReload();
        onClose();
      } catch (error) {
        console.error(error);
        setError("更新に失敗しました");
        throw error; // エラーをスローしてコンポーネントで処理できるようにする
      } finally {
        setLoading(false);
      }
    },
    [api, onReload, onClose]
  );
  const prevCallSidRef = useRef(callSid);
  const prevOpenRef = useRef(open);
  const prevFetchLogDetailRef = useRef(fetchLogDetail);
  // const prevUserRef = useRef(user);

  useEffect(() => {
    console.log(
      "useEffect [callSid, open, fetchLogDetail, user] called with:",
      callSid,
      open
      // user
    );

    // if (open && user && callSid) {
    if (open && callSid) {
      // callSid が空でない場合のみ実行
      fetchLogDetail(callSid);
    } else {
      setData({ transcriptions: [] });
      setStatus("");
    }
    // 現在の値を保存
    prevCallSidRef.current = callSid;
    prevOpenRef.current = open;
    prevFetchLogDetailRef.current = fetchLogDetail;
    // prevUserRef.current = user;
    // }, [callSid, open, user, fetchLogDetail]);
    // }, [callSid, open, fetchLogDetail]);
  }, [callSid, open]);

  const handleChangeStatus = (event) => {
    setStatus(event.target.value);
  };

  const handleChangeMemo = (event) => {
    setData((prev) => ({ ...prev, memo: event.target.value }));
  };

  const handleClickEdit = () => {
    if (editMode) {
      updateLogDetail(callSid, data.memo);
    }
    onEditMode((prev) => !prev);
  };

  if (!open) {
    return null;
  }

  console.log(loading);
  console.log(data);
  // ローディングとエラー表示
  if (loading) {
    return (
      <LogsDetailContainer>
        <Typography>Loading...</Typography>
      </LogsDetailContainer>
    );
  }

  if (error) {
    return (
      <LogsDetailContainer>
        <Typography color="error">{error}</Typography>
      </LogsDetailContainer>
    );
  }

  // 詳細表示部分
  return (
    <LogsDetailContainer>
      {/* 詳細表示部分 */}
      <DetailHeaderPaper elevation={0} square>
        <Grid container justifyContent="space-between">
          <div
            style={{ paddingTop: 4, display: "flex", justifyContent: "center" }}
          >
            <DetailTitleTypography variant="subtitle1">
              応対履歴 - 詳細
            </DetailTitleTypography>
          </div>
          <Button
            variant={!editMode ? "outlined" : "contained"}
            size="small"
            color={!editMode ? "inherit" : "primary"}
            startIcon={!editMode ? <EditIcon /> : <SaveIcon />}
            onClick={handleClickEdit}
          >
            {!editMode ? "編集" : "保存"}
          </Button>
        </Grid>
      </DetailHeaderPaper>
      <DetailPaper variant="outlined" square>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <ListItem style={{ paddingTop: 2, paddingBottom: 2 }}>
              <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                通話詳細
              </Typography>
            </ListItem>
          </Grid>
          <Grid
            item
            xs
            style={{ width: "100%", paddingTop: 0, minHeight: 147 }}
          >
            <Scrollbars>
              <Grid item container wrap="nowrap" spacing={2}>
                <InputGrid item xs={3} style={{ height: 84 }}>
                  <ListItem style={{ paddingTop: 2, paddingBottom: 2 }}>
                    <ListItemText primary="メモ" />
                  </ListItem>
                </InputGrid>
                <Divider orientation="vertical" flexItem />
                <Grid item xs>
                  <ListItem style={{ paddingTop: 2, paddingBottom: 2 }}>
                    {!editMode ? (
                      <ListItemText primary={data.memo} />
                    ) : (
                      <TextField
                        id="memo-input"
                        multiline
                        rowsMax={4}
                        value={data.memo}
                        style={{ width: "100%" }}
                        variant="standard"
                        onChange={handleChangeMemo}
                      />
                    )}
                  </ListItem>
                </Grid>
              </Grid>
              <CallDetailItem
                label="着信日時"
                value={
                  data.start_time
                    ? new Date(data.start_time).toLocaleString().slice(0, -3)
                    : ""
                }
              />
              <Grid item container wrap="nowrap" spacing={2}>
                <Grid item xs={3}>
                  <ListItem style={{ paddingTop: 2, paddingBottom: 2 }}>
                    <ListItemText primary="ステータス" />
                  </ListItem>
                </Grid>
                <Divider orientation="vertical" flexItem />
                <Grid item xs>
                  <ListItem style={{ paddingTop: 2, paddingBottom: 2 }}>
                    <ListItemText primary={status} />
                  </ListItem>
                </Grid>
              </Grid>
              <CallDetailItem
                label="発信者番号"
                value={"0" + data.call_from?.substring(3)}
              />
              <CallDetailItem label="コールSID" value={data.call_sid} />
              {/* <CallDetailItem
            label="通話音声"
            value={<Player url={data.recording_url} />}
          /> */}
            </Scrollbars>
          </Grid>
        </Grid>
      </DetailPaper>

      <DetailPaper variant="outlined" square style={{ marginTop: 10 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <ListItem style={{ paddingTop: 2, paddingBottom: 2 }}>
              <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                発話結果
              </Typography>
              <Typography variant="body2">
                （発話箇所 {data.user_inputs?.length}）
              </Typography>
            </ListItem>
          </Grid>
          {playerUrl && (
            <Grid item xs={12} style={{ padding: "0 16px 8px 16px" }}>
              <Player
                ref={playerRef}
                url={playerUrl}
                playing={playing}
                onProgress={handleProgress}
                onPlay={handlePlay}
                onPause={handlePause}
              />
            </Grid>
          )}
          <Grid
            item
            xs
            style={{ width: "100%", paddingTop: 0, minHeight: 388 }}
          >
            <Scrollbars>
              <ScrollableList dense={false}>
                {data.user_inputs?.length > 0 && (
                  <TranscriptList
                    items={data.inputs_point}
                    onItemClick={handleTranscriptClick}
                    onStopClick={handleStopClick}
                    playingItemIndex={playingItemIndex}
                  />
                )}
                {/* {data.recording_url && data.user_inputs?.length > 0 && (
                  <AudioPlayerWithTranscript
                    recording_url={data.recording_url}
                    inputs_point={data.inputs_point}
                  />
                )} */}
                {/* {data.user_inputs?.length > 0 ? (
                  data.user_inputs.map((text, index) => (
                    <Grid container wrap="nowrap" spacing={2} key={index}>
                      <Grid item xs={4}>
                        <ListItem>
                          <ListItemText
                            primary={text.question_id}
                            style={{ fontSize: "0.7rem" }}
                          />
                        </ListItem>
                      </Grid>
                      <Divider
                        orientation="vertical"
                        variant="middle"
                        flexItem
                      />
                      <Grid item xs={8}>
                        <ListItem key={index}>
                          <ListItemText primary={text.input} />
                        </ListItem>
                      </Grid>
                    </Grid>
                  ))
                ) : (
                  <></>
                )} */}
              </ScrollableList>
            </Scrollbars>
          </Grid>
        </Grid>
      </DetailPaper>
    </LogsDetailContainer>
  );
}
