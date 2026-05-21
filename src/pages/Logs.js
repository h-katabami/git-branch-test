import React, { useState, useCallback, useMemo } from "react";
import { styled } from "@mui/material/styles";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";

import LogsList from "../components/LogList";
import LogsDetail from "../components/LogDetail";

const LogsContainer = styled(Container)(({ theme }) => {
  // スタイル
});

const LogsGrid = styled(Grid)(({ theme }) => {
  // スタイル
});

export default function Logs() {
  const [callSid, setCallSid] = useState("");
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isReloading, setIsReloading] = useState(false);

  const handleRowClick = useCallback((id) => {
    setCallSid(id);
    setIsDetailOpen(true);
  }, []);

  const handleEditMode = useCallback((mode) => {
    setIsEditMode(mode);
  }, []);

  const handleDetailClose = useCallback(() => {
    setIsDetailOpen(false);
  }, []);

  const handleReload = useCallback(() => {
    setIsReloading(true);
    setTimeout(() => {
      setIsReloading(false);
    }, 0);
  }, []);
  // props をメモ化
  const logsListProps = useMemo(() => {
    console.log("useMemo: logsListProps"); // ログ出力
    return {
      onRowClick: handleRowClick,
      open: isDetailOpen,
      onEditMode: handleEditMode,
      onClose: handleDetailClose,
      onReload: handleReload,
      isReloading: isReloading,
    };
  }, [
    handleRowClick,
    isDetailOpen,
    handleEditMode,
    handleDetailClose,
    handleReload,
    isReloading,
  ]);

  const logsDetailProps = useMemo(() => {
    console.log("useMemo: logsDetailProps"); // ログ出力
    return {
      callSid: callSid,
      open: isDetailOpen,
      editMode: isEditMode,
      onEditMode: handleEditMode,
      onClose: handleDetailClose,
      onReload: handleReload,
    };
  }, [
    callSid,
    isDetailOpen,
    isEditMode,
    handleEditMode,
    handleDetailClose,
    handleReload,
  ]);

  return (
    <LogsContainer>
      <LogsGrid container spacing={2}>
        <Grid item xs={4}>
          <LogsList {...logsListProps} />
        </Grid>
        {/* <Divider orientation="vertical" flexItem /> */}
        <Grid item xs={8}>
          <LogsDetail {...logsDetailProps} />
        </Grid>
      </LogsGrid>
    </LogsContainer>
  );
}
