// React + Web3 Essentials
import React from 'react';

// External Packages
import styled, { useTheme } from 'styled-components';

// Internal Compoonents
import BlurBG from 'components/reusables/blurs/BlurBG';
import ProgressBar from 'components/reusables/progress/ProgressBarUnit';
import { ItemHV2, ItemVV2, SpanV2 } from 'components/reusables/SharedStylingV2';
import Spinner from 'components/reusables/spinners/SpinnerUnit';

// Internal Configs
import GLOBALS from 'config/Globals';

export const LOADER_TYPE = {
  STANDALONE: 1,
  STANDALONE_MINIMAL: 2,
  SEAMLESS: 3,
};

export const LOADER_OVERLAY = {
  NORMAL: 1,
  ONTOP: 2,
};

export const PROGRESS_POSITIONING = {
  TOP: 1,
  BOTTOM: 2,
};

interface LoaderSpinnerI {
  type?: number;
  overlay?: number;
  blur?: number;
  title?: string;
  width?: string;
  spinnerEnabled?: boolean;
  spinnerSize?: number;
  spinnerColor?: string;
  spinnerCompleted?: boolean;
  progressEnabled?: boolean;
  progressPositioning?: number;
  progressColor?: string;
  progressVerticalGap: string;
  progress?: number;
}

// Create Progress Bar
const LoaderSpinner = ({
  type = LOADER_TYPE.STANDALONE,
  overlay = LOADER_OVERLAY.NORMAL,
  blur = 0,
  title = null,
  width = '50%',
  spinnerEnabled = true,
  spinnerSize = 42,
  spinnerColor = GLOBALS.COLORS.PRIMARY_PINK,
  spinnerCompleted = false,
  progressEnabled = false,
  progressPositioning = PROGRESS_POSITIONING.TOP,
  progressColor = GLOBALS.COLORS.PRIMARY_PINK,
  progressVerticalGap = '40px',
  progress = 0,
}: LoaderSpinnerI) => {
  const theme = useTheme();

  return (
    <ItemVV2
      position={overlay == LOADER_OVERLAY.ONTOP ? 'absolute' : 'relative'}
      top="0"
      right="0"
      bottom="0"
      left="0"
      zIndex="99"
    >
      {overlay === LOADER_OVERLAY.ONTOP && <BlurBG blur={blur} />}

      <ItemVV2
        flex="initial"
        alignSelf={type == LOADER_TYPE.SEAMLESS ? 'auto' : 'center'}
        width={type == LOADER_TYPE.STANDALONE_MINIMAL ? 'auto' : width}
        padding={type == LOADER_TYPE.SEAMLESS ? '0px' : GLOBALS.ADJUSTMENTS.PADDING.DEFAULT}
        borderRadius={type == LOADER_TYPE.SEAMLESS ? '0px' : GLOBALS.ADJUSTMENTS.RADIUS.SMALL}
        border={type == LOADER_TYPE.SEAMLESS ? 'transparent' : `1px solid ${theme.default.border}`}
        background={type == LOADER_TYPE.SEAMLESS ? 'initial' : theme.default.bg}
      >
        {progressEnabled && progressPositioning == PROGRESS_POSITIONING.TOP && (
          <>
            <ProgressBar
              percent={progress}
              color={progressColor}
            />
            {(title || spinnerEnabled) && <ItemVV2 margin={`0 0 ${progressVerticalGap} 0`}></ItemVV2>}
          </>
        )}

        <ItemHV2>
          {spinnerEnabled && (
            <Spinner
              size={spinnerSize}
              color={spinnerColor}
              completed={spinnerCompleted}
            />
          )}

          {title && (
            <SpanV2
              padding="10px"
              fontWeight="500"
              color={theme.default.color}
            >
              {title}
            </SpanV2>
          )}
        </ItemHV2>

        {progressEnabled && progressPositioning == PROGRESS_POSITIONING.BOTTOM && (
          <>
            {(title || spinnerEnabled) && <ItemVV2 margin={`${progressVerticalGap} 0 0 0`}></ItemVV2>}
            <ProgressBar
              percent={progress}
              color={progressColor}
            />
          </>
        )}
      </ItemVV2>
    </ItemVV2>
  );
};
export default LoaderSpinner;
