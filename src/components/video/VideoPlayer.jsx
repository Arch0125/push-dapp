// React + Web3 Essentials
import React, { useContext } from 'react';

// External Packages
import { Grid, makeStyles, Paper, Typography } from '@material-ui/core';
import styled, { useTheme } from 'styled-components';

// Internal Components
import { VideoCallContext } from 'contexts/VideoCallContext';
import { ItemVV2, SectionV2 } from 'components/reusables/SharedStylingV2';


const useStyles = makeStyles((theme) => ({
  video: {
    width: '550px',
    [theme.breakpoints.down('xs')]: {
      width: '300px',
    },
  },
  gridContainer: {
    justifyContent: 'center',
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
    },
  },
  paper: {
    padding: '10px',
    border: '2px solid black',
    margin: '10px',
  },
}));

const VideoPlayer = () => {
  const { name, callAccepted, myVideo, userVideo, callEnded, me, localStream, call } = useContext(VideoCallContext);
  const classes = useStyles();

  return (
    <ItemVV2
      overflow="hidden"
    >
      {localStream && (
        <OwnVideo playsInline muted ref={myVideo} autoPlay className={callAccepted && !callEnded ? 'connectionAccepted' : null} />
      )}
      {callAccepted && !callEnded && (
        <TheirVideo playsInline ref={userVideo} autoPlay />
      )}
    </ItemVV2>
    // <Grid container className={classes.gridContainer}>
    //   {stream && (
    //     <Paper className={classes.paper}>
    //       <Grid item xs={12} md={6}>
    //         <Typography variant="h5" gutterBottom>{name || 'Name'}</Typography>
    //         <video playsInline muted ref={myVideo} autoPlay className={classes.video} />
    //       </Grid>
    //     </Paper>
    //   )}
    //   {callAccepted && !callEnded && (
    //     <Paper className={classes.paper}>
    //       <Grid item xs={12} md={6}>
    //         <Typography variant="h5" gutterBottom>{call.name || 'Name'}</Typography>
    //         <video playsInline ref={userVideo} autoPlay className={classes.video} />
    //       </Grid>
    //     </Paper>
    //   )}
    // </Grid>
  );
};
export default VideoPlayer;

const OwnVideo = styled.video`
  width: 100%;
  transition: all 0.25 linear;

  &.connectionAccepted {
    position: absolute;
    width: inherit;
    right: 20px;
    bottom: 20px;
    height: 25%;
    border: 1px solid #ffffff8c;
    border-radius: 24px;
  }
`;

const TheirVideo = styled.video`
  width: 100%;
`