// React + Web3 Essentials
import React from 'react';

// External Packages
import styled, { ThemeProvider, useTheme } from 'styled-components';

// Internal Components
import { ShowLoaderToastType, ShowMessageToastType } from './useToast';
import BlurBG from '../components/reusables/blurs/BlurBG';
import { ItemHV2, ItemVV2 } from '../components/reusables/SharedStylingV2';

export type ModalInnerComponentType = {
  onConfirm: (value?: any) => any;
  onClose?: () => void;
  toastObject: {
    showLoaderToast: ShowLoaderToastType;
    showMessageToast: ShowMessageToastType;
  };
};

export type ModalType = {
  InnerComponent: ({ onConfirm, onClose }: ModalInnerComponentType) => JSX.Element;
  onConfirm: (value?: any) => any;
  toastObject: {
    showLoaderToast: ShowLoaderToastType;
    showMessageToast: ShowMessageToastType;
  };
};

export type ModalProps={
  padding?:string
}

const useModalBlur = ({padding}:ModalProps) => {
  const [open, setOpen] = React.useState(false);

  // hacky fix to prevent background scroll when modal is open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '1rem';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    }
  }, [open]);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const ModalComponent = ({ InnerComponent, onConfirm, toastObject }: ModalType) => {
    const themes = useTheme();

    return (
      <ThemeProvider theme={themes}>
        {open && <ItemHV2
          position="absolute"
          alignSelf="stretch"
          flex="initial"
          top="0"
          right="0"
          bottom="0"
          left="0"
          zIndex="10"
        >
          <BlurBG
            blur={10}
            zIndex={2}
          />
          <ItemHV2
              display = 'flex'
              position = 'relative'
              zIndex = {10}
              width = 'fit-content'
              height = 'fit-content'
              background={themes.blurModalContentBackground}
              alignSelf = "center"
              flex = 'initial'
              padding = {padding? padding:'1.2% 2%'}
              borderRadius = '16px'
              boxShadow = 'none'
          >
            <InnerComponent
              onConfirm={onConfirm}
              onClose={handleClose}
              toastObject={toastObject}
            />
          </ItemHV2>
        </ItemHV2>}
      </ThemeProvider>
    );
  };

  return { isModalOpen: open, showModal: handleOpen, ModalComponent };
};



export default useModalBlur;