// React + Web3 Essentials
import React from 'react';

// External Packages
import ReactGA from 'react-ga';
import styled from 'styled-components';

// Internal Compoonents
import InboxComponent from 'components/InboxComponent';
import { Section } from 'primaries/SharedStyling';

// Internal Configs
import { appConfig } from 'config';
import GLOBALS, { device, globalsMargin } from 'config/Globals';

// Constants
export const ALLOWED_CORE_NETWORK = appConfig.coreContractChain;

// Create Inbox Module
const InboxModule = () => {
  // React GA Analytics
  ReactGA.pageview('/inbox');

  // Render
  return (
    <Container>
      <InboxComponent />
    </Container>
  );
};
export default InboxModule;

// css style
const Container = styled(Section)`
  align-items: stretch;
  align-self: stretch;
  flex: 1;
  background: ${(props) => props.theme.default.bg};
  border-top-left-radius: ${GLOBALS.ADJUSTMENTS.RADIUS.LARGE};
  box-shadow: ${GLOBALS.ADJUSTMENTS.MODULE_BOX_SHADOW};
  display: flex;
  flex-direction: column;
  flex: initial;
  justify-content: center;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;

  margin: ${GLOBALS.ADJUSTMENTS.MARGIN.BIG_MODULES.DESKTOP};
  height: calc(
    100vh - ${GLOBALS.CONSTANTS.HEADER_HEIGHT}px - ${globalsMargin.BIG_MODULES.DESKTOP.TOP} -
      ${globalsMargin.BIG_MODULES.DESKTOP.BOTTOM}
  );

  @media ${device.laptop} {
    margin: ${GLOBALS.ADJUSTMENTS.MARGIN.BIG_MODULES.TABLET};
    height: calc(
      100vh - ${GLOBALS.CONSTANTS.HEADER_HEIGHT}px - ${globalsMargin.BIG_MODULES.TABLET.TOP} -
        ${globalsMargin.BIG_MODULES.TABLET.BOTTOM}
    );
    border-radius: ${GLOBALS.ADJUSTMENTS.RADIUS.LARGE}  ${GLOBALS.ADJUSTMENTS.RADIUS.LARGE}  ${GLOBALS.ADJUSTMENTS.RADIUS.LARGE}  ${GLOBALS.ADJUSTMENTS.RADIUS.LARGE};
  }

  @media ${device.mobileL} {
    margin: ${GLOBALS.ADJUSTMENTS.MARGIN.BIG_MODULES.MOBILE};
    height: calc(
      100vh - ${GLOBALS.CONSTANTS.HEADER_HEIGHT}px - ${globalsMargin.BIG_MODULES.MOBILE.TOP} -
        ${globalsMargin.BIG_MODULES.MOBILE.BOTTOM}
    );
    border: ${GLOBALS.ADJUSTMENTS.RADIUS.LARGE};
    border-radius: ${GLOBALS.ADJUSTMENTS.RADIUS.LARGE} ${GLOBALS.ADJUSTMENTS.RADIUS.LARGE}  0 0;
  }
`;