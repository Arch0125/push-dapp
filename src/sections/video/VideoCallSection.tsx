// React + Web3 Essentials
import { useWeb3React } from '@web3-react/core';
import React, { useContext, useState } from "react";

// External Packages
import styled from 'styled-components';
import { MdCall, MdCallEnd } from 'react-icons/md';

// Internal Compoonents
import LoaderSpinner, {
  LOADER_OVERLAY, LOADER_SPINNER_TYPE, LOADER_TYPE,
  PROGRESS_POSITIONING
} from 'components/reusables/loaders/LoaderSpinner';
import { ButtonV2, ItemVV2, SectionV2 } from 'components/reusables/SharedStylingV2';
import VideoPlayer from 'components/video/VideoPlayer';
import { VideoCallContext } from 'contexts/VideoCallContext';
import { BlockedLoadingI } from 'types/chat';

// Internal Configs
import GLOBALS, { device } from 'config/Globals';


// Interface
export interface VideoCallInfoI {
  address: string;
  fromPublicKeyArmored: string;
  toPublicKeyArmored: string;
  privateKeyArmored: string;
  establishConnection: number;
}

interface VideoCallSectionPropsI {
  videoCallInfo: VideoCallInfoI;
  setVideoCallInfo: Function;
  endVideoCallHook: Function;
}

// Create Video Call
const videoCallSection = ({ videoCallInfo, setVideoCallInfo, endVideoCallHook }: VideoCallSectionPropsI) => {
  const [isLoading, setLoading] = useState(true);
  const [blockedLoading, setBlockedLoading] = useState<BlockedLoadingI>({
    enabled: false,
    title: null,
  });

  // get account
  const { account } = useWeb3React();

  // get stream
  const { initializeLocalStream, localStream, answerCall, leaveCall, callUser } = useContext(VideoCallContext);
  
  React.useEffect(() => {
    const setupStream = async () => {
      setBlockedLoading({
        enabled: true,
        title: 'Setting up Video...',
        progressEnabled: false,
      });

      // await new Promise(r => setTimeout(r, 200));
      
      try {
        // initialize the local stream for the given account
        if(!localStream){
          await initializeLocalStream(account);
        }
        else{
          // send notification with id 
          if (videoCallInfo.establishConnection == 1) {
            console.log("CALLING A USER");
            console.log("fromAddress", account);
            console.log("toAddress", videoCallInfo.address);
            
            callUser(account, videoCallInfo.address);
          } else if (videoCallInfo.establishConnection == 2) {
            // do nothing video player should handle that
          }
        }

        setBlockedLoading({
          enabled: false,
          title: 'Setting up Video...',
          progressEnabled: false,
        });
        setLoading(false);
      } 
      catch (err) {
        setBlockedLoading({
          enabled: true,
          title: `Error: ${err}`,
          spinnerType: LOADER_SPINNER_TYPE.PROCESSING,
          progressEnabled: false,
        });
      }
    }

    setupStream();
  }, [localStream]);

  // RENDER
  return (
    <Container>
      <VideoPlayer />

      {/* Control Panel */}
      <ItemVV2
        position="absolute"
        right="0"
        left="0"
        bottom="40px"
      >
      {videoCallInfo.establishConnection == 1 && 
        <ItemVV2
          flex="initial"
          margin="0px 0px 0px 10px"
          alignSelf="center"
          alignItems="center"
          width="48px"
          height="48px"
          top="10px"
          right="0px"
        >
          <ButtonV2
            alignSelf="stretch"
            background="#e60808"
            hoverBackground="transparent"
            borderRadius="50%"
            onClick={() => {
              endVideoCallHook();
            }}
          >
            <MdCallEnd style={{ color: '#FFFFFF', fontSize: '24px', cursor: 'pointer' }} />
          </ButtonV2>
        </ItemVV2>
      }

      {videoCallInfo.establishConnection == 2 && 
        <ItemVV2
          flex="initial"
          margin="0px 0px 0px 10px"
          alignItems="center"
          alignSelf="center"
          width="48px"
          height="48px"
          top="10px"
          right="0px"
        >
          <ButtonV2
            alignSelf="stretch"
            background="#08e673"
            hoverBackground="transparent"
            borderRadius="50%"
            onClick={() => {
              setVideoCallInfo({
                address: videoCallInfo.address,
                fromPublicKeyArmored: videoCallInfo.fromPublicKeyArmored,
                toPublicKeyArmored: videoCallInfo.toPublicKeyArmored,
                privateKeyArmored: videoCallInfo.privateKeyArmored,
                establishConnection: 3,
              })
              answerCall(videoCallInfo.address, account);
            }}
          >
            <MdCall style={{ color: '#FFFFFF', fontSize: '24px', cursor: 'pointer' }} />
          </ButtonV2>
        </ItemVV2>
      }

      {videoCallInfo.establishConnection == 3 && 
        <ItemVV2
          flex="initial"
          margin="0px 0px 0px 10px"
          alignItems="center"
          alignSelf="center"
          width="48px"
          height="48px"
          top="10px"
          right="0px"
        >
          <ButtonV2
            alignSelf="stretch"
            background="#e60808"
            hoverBackground="transparent"
            borderRadius="50%"
            onClick={() => {
              leaveCall();
              endVideoCallHook();
            }}
          >
            <MdCallEnd style={{ color: '#FFFFFF', fontSize: '24px', cursor: 'pointer' }} />
          </ButtonV2>
        </ItemVV2>
      }
      </ItemVV2>

      {/* This always needs to be last */}
      {blockedLoading.enabled && (
        <LoaderSpinner
          type={LOADER_TYPE.STANDALONE}
          overlay={LOADER_OVERLAY.ONTOP}
          blur={GLOBALS.ADJUSTMENTS.BLUR.DEFAULT}
          title={blockedLoading.title}
          width="50%"
          spinnerEnabled={blockedLoading.spinnerEnabled}
          spinnerSize={blockedLoading.spinnerSize}
          spinnerType={blockedLoading.spinnerType}
          progressEnabled={blockedLoading.progressEnabled}
          progressPositioning={PROGRESS_POSITIONING.BOTTOM}
          progress={blockedLoading.progress}
          progressNotice={blockedLoading.progressNotice}
        />
      )}
    </Container>
  );
}
export default videoCallSection;

// css styles
const Container = styled(SectionV2)`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 9999;
  background: ${(props) => props.theme.default.bg};
`