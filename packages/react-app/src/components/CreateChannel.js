import React, { useState, useRef, useEffect } from "react";
import Select from "react-select";
import styled, { css, useTheme } from "styled-components";
import {
  Section,
  Content,
  Item,
  ItemH,
  ItemBreak,
  H1,
  H2,
  H3,
  Image,
  P,
  Span,
  Anchor,
  Button,
  Showoff,
  FormSubmision,
  Input,
  TextField,
} from "components/SharedStyling";
import { FiLink } from "react-icons/fi";
import "react-dropzone-uploader/dist/styles.css";
import Dropzone from "react-dropzone-uploader";
import { makeStyles } from "@material-ui/core/styles";
import Slider from "@material-ui/core/Slider";
import Loader from "react-loader-spinner";
import { useWeb3React, UnsupportedChainIdError } from "@web3-react/core";
import { ThemeProvider } from "styled-components";
import { themeLight, themeDark } from "config/Themization";
import { addresses, abis } from "@project/contracts";
import ImageClipper from "./ImageClipper";
import { ReactComponent as ImageIcon } from "../assets/Image.svg";

const ethers = require("ethers");

const ipfs = require("ipfs-api")();

const minStakeFees = 50;
const ALIAS_CHAINS = [{ value: "POLYGON_TEST_MUMBAI:80001", label: "Polygon" }];

// Create Header
function CreateChannel() {
  const { active, error, account, library, chainId } = useWeb3React();

  const themes = useTheme();

  const [darkMode, setDarkMode] = useState(false);

  const [processing, setProcessing] = React.useState(0);
  const [processingInfo, setProcessingInfo] = React.useState("");

  const [uploadDone, setUploadDone] = React.useState(false);
  const [stakeFeesChoosen, setStakeFeesChoosen] = React.useState(false);
  const [channelInfoDone, setChannelInfoDone] = React.useState(false);

  const [chainDetails, setChainDetails] = React.useState("");
  const [channelName, setChannelName] = React.useState("");
  const [channelAlias, setChannelAlias] = React.useState("");
  const [channelInfo, setChannelInfo] = React.useState("");
  const [channelURL, setChannelURL] = React.useState("");
  const [channelFile, setChannelFile] = React.useState(undefined);
  const [channelStakeFees, setChannelStakeFees] = React.useState(minStakeFees);

  //image upload states
  const childRef = useRef();
  const [view, setView] = useState(false);
  const [final, setFinal] = useState(false);
  const [imageSrc, setImageSrc] = useState(undefined);
  const [croppedImage, setCroppedImage] = useState(undefined);

  const [stepFlow, setStepFlow] = React.useState(1);

  React.useEffect(() => {});

  // called every time a file's `status` changes
  const handleChangeStatus = ({ meta, file }, status) => {
    console.log(status, meta, file);
  };

  const onDropHandler = (files) => {
    //   var file = files[0]
    //   const reader = new FileReader();
    //   reader.onload = (event) => {
    //     console.log(event.target.result);
    //   };
    //   reader.readAsDataURL(file);
    // setChannelFile(file);
    // console.log("Drop Handler");
    // console.log(file);
  };

  // receives array of files that are done uploading when submit button is clicked
  const handleLogoSubmit = (files, allFiles) => {
    // console.log(files.map(f => f.meta))
    allFiles.forEach((f) => {
      var file = f.file;
      var reader = new FileReader();
      reader.readAsDataURL(file);
      // console.log(f.file);

      reader.onloadend = function(e) {
        // console.log(reader.result);
        const response = handleLogoSizeLimitation(reader.result);
        if (response.success) {
          setStepFlow(2);
          setProcessing(0);
          setUploadDone(true);
          setChannelFile(reader.result);
        } else {
          setProcessing(3);
          setProcessingInfo(response.info);
        }
      };
    });
  };

  const proceed = () => {
    setStepFlow(2);
    setProcessing(0);
    setUploadDone(true);
    console.log(channelFile);
  };

  const handleLogoSizeLimitation = (base64) => {
    // Setup Error on higher size of 128px
    var sizeOf = require("image-size");
    var base64Data = base64.split(";base64,").pop();
    var img = Buffer.from(base64Data, "base64");
    var dimensions = sizeOf(img);

    // Only proceed if image is equal to or less than 128
    if (dimensions.width > 128 || dimensions.height > 128) {
      console.log("Image size check failed... returning");
      return {
        success: 0,
        info: "Image size check failed, Image should be 128X128PX",
      };
    }

    // only proceed if png or jpg
    // This is brilliant: https://stackoverflow.com/questions/27886677/javascript-get-extension-from-base64-image
    // char(0) => '/' : jpg
    // char(0) => 'i' : png
    let fileext;
    console.log(base64Data.charAt(0));
    if (base64Data.charAt(0) == "/") {
      return {
        success: 1,
        info: "Image checks passed",
      };
    } else if (base64Data.charAt(0) == "i") {
      return {
        success: 1,
        info: "Image checks passed",
      };
    } else {
      return {
        success: 0,
        info: "Image extension should be jpg or png",
      };
    }
  };

  const handleCreateChannel = async (e) => {
    // Check everything in order
    // skip this for now
    e.preventDefault();

    if (
      isEmpty(channelName) ||
      isEmpty(channelInfo) ||
      isEmpty(channelURL) ||
      isEmpty(channelFile) ||
      channelAlias
        ? isEmpty(chainDetails)
        : chainDetails
        ? isEmpty(channelAlias)
        : false
    ) {
      setProcessing(3);
      setProcessingInfo("Channel Fields are Empty! Please retry!");

      return false;
    }

    // Check complete, start logic
    setChannelInfoDone(true);
    setProcessing(1);

    console.log({
      chainDetails,
      channelAlias,
    });
    var chainDetailsSplit = chainDetails.split(":");
    var blockchain = chainDetailsSplit[0];
    var chain_id = chainDetailsSplit[1];
    var address = channelAlias;

    const input = JSON.stringify({
      name: channelName,
      info: channelInfo,
      url: channelURL,
      icon: channelFile,
      blockchain: blockchain,
      chain_id: chain_id,
      address: address,
    });

    const ipfs = require("nano-ipfs-store").at("https://ipfs.infura.io:5001");

    setProcessingInfo("Uploading Payload...");
    const storagePointer = await ipfs.add(input);
    console.log("IPFS storagePointer:", storagePointer);
    setProcessingInfo("Payload Uploaded, Approval to transfer DAI...");
    //console.log(await ipfs.cat(storagePointer));

    // Send Transaction
    // First Approve DAI
    var signer = library.getSigner(account);

    let daiContract = new ethers.Contract(addresses.dai, abis.erc20, signer);

    // Pick between 50 DAI AND 25K DAI
    const fees = ethers.utils.parseUnits(channelStakeFees.toString(), 18);

    var sendTransactionPromise = daiContract.approve(addresses.epnscore, fees);
    const tx = await sendTransactionPromise;

    console.log(tx);
    console.log("waiting for tx to finish");
    setProcessingInfo("Waiting for Approval TX to finish...");

    await library.waitForTransaction(tx.hash);

    let contract = new ethers.Contract(
      addresses.epnscore,
      abis.epnscore,
      signer
    );

    const channelType = 2; // Open Channel
    const identity = "1+" + storagePointer; // IPFS Storage Type and HASH
    const identityBytes = ethers.utils.toUtf8Bytes(identity);

    var anotherSendTxPromise = contract.createChannelWithFees(
      channelType,
      identityBytes,
      fees
    );

    setProcessingInfo("Creating Channel TX in progress");
    anotherSendTxPromise
      .then(async function(tx) {
        console.log(tx);
        console.log("Check: " + account);
        await library.waitForTransaction(tx.hash);
        setProcessing(3);
        setProcessingInfo("Channel Created! Reloading...");

        setTimeout(() => {
          window.location.reload();
        }, 2000);
      })
      .catch((err) => {
        console.log("Error --> %o", err);
        console.log({ err });
        setProcessing(3);
        setProcessingInfo(
          "!!!PRODUCTION ENV!!! Contact support@epns.io to whitelist your wallet"
        );
      });
  };

  const isEmpty = (field) => {
    if (field.trim().length == 0) {
      return true;
    }

    return false;
  };

  //mind Dai
  const mintDai = async () => {
    try {
      var signer = library.getSigner(account);
      let daiContract = new ethers.Contract(addresses.dai, abis.dai, signer);
      console.log({
        daiContract,
      });
      console.log(1);
      let daiAmount = 1000;
      const amount = ethers.utils.parseUnits(daiAmount.toString(), 18);
      console.log(2);
      var mintTransactionPromise = daiContract.mint(amount);
      console.log(3);
      const tx = await mintTransactionPromise;
      console.log(tx);
      await library.waitForTransaction(tx.hash);
      console.log(4);
      setProcessingInfo("1000 Dai minted successfully!");
      console.log("Transaction Completed");
    } catch (err) {
      console.log(err);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleOnDrop = (e) => {
    //prevent the browser from opening the image
    e.preventDefault();
    e.stopPropagation();
    //let's grab the image file
    handleFile(e.dataTransfer, "transfer");
  };

  const handleFile = async (file, path) => {
    setCroppedImage(undefined);
    setView(true);
    setFinal(false);

    //you can carry out any file validations here...
    if (file?.files[0]) {
      var reader = new FileReader();
      reader.readAsDataURL(file?.files[0]);

      reader.onloadend = function(e) {
        setImageSrc(reader.result);
      };
    } else {
      return "Nothing....";
    }
  };

  useEffect(() => {
    if (croppedImage) {
      toDataURL(croppedImage, function(dataUrl) {
        const response = handleLogoSizeLimitation(dataUrl);
        if (response.success) {
          setChannelFile(croppedImage);
        }
      });
    } else {
      return "Nothing";
    }
  }, [croppedImage]);

  function toDataURL(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
      var reader = new FileReader();
      reader.onloadend = function() {
        callback(reader.result);
      };
      reader.readAsDataURL(xhr.response);
    };
    xhr.open("GET", url);
    xhr.responseType = "blob";
    xhr.send();
  }

  return (
    <ThemeProvider theme={themes}>
      <Section>
        <Content padding="10px 20px 20px">
          <Item align="flex-start">
            <H2 textTransform="uppercase" spacing="0.1em">
              <Span bg="#674c9f" color="#fff" weight="600" padding="0px 8px">
                Create
              </Span>
              <Span weight="200" color={themes.color}>
                {" "}
                Your Channel!
              </Span>
            </H2>
            <H3 color={themes.createColor}>
              <b color={themes.createColor}>
                Ethereum Push Notification Service
              </b>{" "}
              (EPNS) makes it extremely easy to open and maintain a genuine
              channel of communication with your users.
            </H3>
          </Item>
        </Content>
      </Section>

      <Section>
        <Content padding="0px 20px 20px">
          <ItemH justify="space-between">
            <Step
              bg="#fff"
              activeBG="#e20880"
              type={stepFlow >= 1 ? "active" : "inactive"}
            />
            <Step
              bg="#fff"
              activeBG="#e20880"
              type={stepFlow >= 2 ? "active" : "inactive"}
            />
            <Step
              bg="#fff"
              activeBG="#e20880"
              type={stepFlow >= 3 ? "active" : "inactive"}
            />
            <Line />
          </ItemH>
        </Content>
      </Section>

      {/* Image Upload Section */}
      {!uploadDone && (
        <Section>
          <Content padding="50px 20px 20px">
            <Item align="flex-start">
              <H3 color="#e20880" margin="0px 0px">
                Upload Channel Logo to start the process. Clip image to resize
                to 128x128px.
              </H3>
            </Item>

            <Space className="">
              <div>
                <div
                  onDragOver={(e) => handleDragOver(e)}
                  onDrop={(e) => handleOnDrop(e)}
                  className="bordered"
                >
                  <div className="inner">
                    {view ? (
                      <div className="crop-div">
                        {croppedImage ? (
                          <div>
                            <img
                              alt="Cropped Img"
                              src={croppedImage}
                              className="croppedImage"
                            />
                          </div>
                        ) : (
                          <ImageClipper
                            className="cropper"
                            imageSrc={imageSrc}
                            onImageCropped={(croppedImage) =>
                              setCroppedImage(croppedImage)
                            }
                            ref={childRef}
                          />
                        )}
                      </div>
                    ) : (
                      <ImageIcon />
                    )}

                    <ButtonSpace>
                      <div className="crop-button">
                        {view &&
                          (!croppedImage ? (
                            <Button
                              bg="#1C4ED8"
                              onClick={() => {
                                childRef.current.showCroppedImage();
                              }}
                            >
                              Clip Image
                            </Button>
                          ) : (
                            <div className="crop-button">
                              <Button bg="#1C4ED8" onClick={() => proceed()}>
                                Next
                              </Button>
                            </div>
                          ))}
                      </div>
                    </ButtonSpace>

                    <div className="text-div">
                      <label htmlFor="file-upload" className="labeled">
                        <div>Upload a file</div>
                        <input
                          id="file-upload"
                          accept="image/*"
                          name="file-upload"
                          hidden
                          onChange={(e) => handleFile(e.target, "target")}
                          type="file"
                          className="sr-only"
                          readOnly
                        />
                      </label>
                      <div className="">- or drag and drop</div>
                    </div>
                    <p className="text-below">
                      PNG, JPG.Proceed to clip and submit final
                    </p>
                  </div>
                </div>
              </div>
            </Space>

            {/* <Item margin="-10px 0px 20px 0px">
              <Dropzone
                onChangeStatus={handleChangeStatus}
                onSubmit={handleLogoSubmit}
                onDrop={onDropHandler}
                maxFiles={1}
                multiple={false}
                accept="image/jpeg,image/png"
              />
            </Item> */}
            {chainId != 1 ? (
              <Item align="flex-end">
                <Minter
                  onClick={() => {
                    mintDai();
                  }}
                >
                  <Pool>
                    <br></br>
                    <PoolShare>Get Free DAI for Channel</PoolShare>
                  </Pool>
                </Minter>
              </Item>
            ) : (
              <></>
            )}
          </Content>
        </Section>
      )}

      {/* Stake Fees Section */}
      {uploadDone && !stakeFeesChoosen && (
        <Section>
          <Content padding="50px 0px 0px 0px">
            {/* <Item align="flex-start" margin="0px 20px">
              <H3 color="#e20880">Set your staking fees in DAI</H3>
            </Item> */}

            <Item
              margin="-10px 20px 20px 20px"
              padding="20px 20px 10px 20px"
              bg="#f1f1f1"
            >
              {/* <Slider
                defaultValue={minStakeFees}
                onChangeCommitted={(event, value) => setChannelStakeFees(value)}
                aria-labelledby="discrete-slider"
                valueLabelDisplay="auto"
                step={minStakeFees}
                marks
                min={minStakeFees}
                max={25000}
              /> */}
              <Span
                weight="400"
                size="1.0em"
                textTransform="uppercase"
                spacing="0.2em"
              >
                Amount Staked: {channelStakeFees} DAI
              </Span>
            </Item>

            <Item self="stretch" align="stretch" margin="20px 0px 0px 0px">
              <Button
                bg="#e20880"
                color="#fff"
                flex="1"
                radius="0px"
                padding="20px 10px"
                onClick={() => {
                  setStakeFeesChoosen(true);
                  setStepFlow(3);
                }}
              >
                <Span
                  color="#fff"
                  weight="400"
                  textTransform="uppercase"
                  spacing="0.1em"
                >
                  Continue
                </Span>
              </Button>
            </Item>
          </Content>
        </Section>
      )}

      {/* Channel Entry */}
      {uploadDone && stakeFeesChoosen && !channelInfoDone && (
        <Section>
          <Content padding="50px 0px 0px 0px">
            <Item align="flex-start" margin="0px 20px">
              <H3 color="#e20880">Setup your Channel Info</H3>
            </Item>

            <FormSubmision
              flex="1"
              direction="column"
              margin="0px"
              justify="center"
              size="1.1rem"
              onSubmit={handleCreateChannel}
            >
              <Item
                margin="-10px 20px 15px 20px"
                flex="1"
                self="stretch"
                align="stretch"
              >
                <Input
                  required
                  placeholder="Your Channel Name"
                  maxlength="40"
                  padding="12px"
                  border="1px solid #000"
                  weight="400"
                  size="1.2em"
                  bg="#fff"
                  value={channelName}
                  onChange={(e) => {
                    setChannelName(e.target.value);
                  }}
                />
                {channelName.trim().length == 0 && (
                  <Span
                    padding="4px 10px"
                    right="0px"
                    top="0px"
                    pos="absolute"
                    color="#fff"
                    bg="#000"
                    size="0.7rem"
                    z="1"
                  >
                    Name of Channel
                  </Span>
                )}
              </Item>

              <Item
                margin="15px 20px 15px 20px"
                flex="1"
                self="stretch"
                align="stretch"
                style={{ position: "relative" }}
              >
                <Select
                  className="basic-single"
                  classNamePrefix="select"
                  placeholder="Alias network"
                  name="color"
                  options={ALIAS_CHAINS}
                  theme={(theme) => ({
                    ...theme,
                    borderRadius: 0,
                    colors: {
                      ...theme.colors,
                      primary25: "#e20880",
                      primary: "#e20880",
                    },
                  })}
                  onChange={(selectedOption) => {
                    setChainDetails(selectedOption.value);
                  }}
                />
                <Input
                  placeholder="Your Channel's Alias address"
                  maxlength="40"
                  padding="12px"
                  style={{ paddingLeft: "22%" }}
                  border="1px solid #000"
                  weight="400"
                  size="1rem"
                  bg="#fff"
                  value={channelAlias}
                  onChange={(e) => {
                    setChannelAlias(e.target.value);
                  }}
                />
              </Item>
              <Item
                margin="15px 20px 15px 20px"
                flex="1"
                self="stretch"
                align="stretch"
              >
                <TextField
                  required
                  placeholder="Your Channel's Short Description (200 Characters)"
                  rows="4"
                  maxlength="200"
                  radius="4px"
                  padding="12px"
                  weight="400"
                  border="1px solid #000"
                  bg="#fff"
                  value={channelInfo}
                  onChange={(e) => {
                    setChannelInfo(e.target.value);
                  }}
                  autocomplete="off"
                />
              </Item>

              <ItemH
                margin="15px 20px 15px 20px"
                flex="1"
                self="stretch"
                align="center"
              >
                <Item flex="0" margin="0px 5px 0px 0px">
                  <FiLink size={24} color={themes.color} />
                </Item>
                <Item flex="1" margin="0px 0px 0px 5px" align="stretch">
                  <Input
                    required
                    placeholder="Call to Action Link"
                    padding="12px"
                    border="1px solid #000"
                    radius="4px"
                    weight="400"
                    bg="#f1f1f1"
                    value={channelURL}
                    onChange={(e) => {
                      setChannelURL(e.target.value);
                    }}
                  />
                  {channelURL.trim().length == 0 && (
                    <Span
                      padding="4px 10px"
                      right="0px"
                      top="0px"
                      pos="absolute"
                      color="#fff"
                      bg="#000"
                      size="0.7rem"
                      z="1"
                    >
                      Channel's Website URL
                    </Span>
                  )}
                </Item>
              </ItemH>

              <Item
                margin="15px 0px 0px 0px"
                flex="1"
                self="stretch"
                align="stretch"
              >
                <Button
                  bg="#e20880"
                  color="#fff"
                  flex="1"
                  radius="0px"
                  padding="20px 10px"
                  disabled={processing == 1 ? true : false}
                >
                  {processing == 1 && (
                    <Loader type="Oval" color="#fff" height={24} width={24} />
                  )}
                  {processing != 1 && (
                    <Input
                      cursor="hand"
                      textTransform="uppercase"
                      color="#fff"
                      weight="400"
                      size="0.8em"
                      spacing="0.2em"
                      type="submit"
                      value="Setup Channel"
                    />
                  )}
                </Button>
              </Item>
            </FormSubmision>
          </Content>
        </Section>
      )}

      {/* Channel Setup Progress */}
      {(processing == 1 || processing == 3) && (
        <Section>
          <Content padding="0px 0px 0px 0px">
            {processing == 1 && (
              <Item margin="20px 0px 10px 0px">
                <Loader type="Oval" color="#000" height={24} width={24} />
              </Item>
            )}

            <Item
              color="#fff"
              bg={processing == 1 ? "#e1087f" : "#000"}
              padding="10px 15px"
              margin="15px 0px"
            >
              <Span
                color="#fff"
                textTransform="uppercase"
                spacing="0.1em"
                weight="400"
                size="1em"
              >
                {processingInfo}
              </Span>
            </Item>
          </Content>
        </Section>
      )}
    </ThemeProvider>
  );
}

// css styles
const Step = styled.div`
  height: 12px;
  width: 12px;
  background: ${(props) => props.bg || "#fff"};
  border: 4px solid ${(props) => props.activeBG || "#000"};
  border-radius: 100%;

  ${({ type }) =>
    type == "active" &&
    css`
      background: ${(props) => props.activeBG || "#ddd"};
      border: 4px solid #00000022;
    `};
`;

const Line = styled.div`
  position: absolute;
  height: 5px;
  background: #f1f1f1;
  right: 0;
  left: 0;
  margin: 0px 10px;
  z-index: -1;
`;

const Channel = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const Notice = styled.div`
  margin-top: 10px;
  display: flex;
  flex-direction: column;
`;

const Title = styled.h1`
  color: #674c9f;
  font-size: 30px;
  font-weight: 300;
  margin-top: 0px;
  margin-bottom: 30px;
`;

const Info = styled.label`
  padding-bottom: 20px;
  font-size: 14px;
  color: #000;
`;

const Info2 = styled(Info)``;
const Name = styled(Input)`
  border-bottom: 1px solid #e20880;
  font-size: 24px;
`;

const ShortInfo = styled.textarea`
  outline: 0;
  border: 0;
  border-bottom: 1px solid #35c5f3;
  margin: 10px;
  font-size: 18px;
  min-height: 80px;
  color: #111;
`;

const Url = styled(Input)`
  border-bottom: 1px solid #674c9f;
  font-size: 1=8px;
`;

const Text = styled.span``;

const Continue = styled.button`
  border: 0;
  outline: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  border-radius: 20px;
  font-size: 14px;
  background: ${(props) => props.theme || "#674c9f"};
  margin: 30px 0px 0px 0px;
  border-radius: 8px;
  padding: 16px;
  font-size: 16px;
  font-weight: 400;
`;
const Minter = styled.div`
  display: flex;
  flex-direction: row;
  font-size: 13px;
`;

const ChannelMetaBox = styled.label`
  margin: 0px 5px;
  color: #fff;
  font-weight: 600;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 15px;
  // font-size: 11px;
`;
const Pool = styled.div`
  margin: 0px 10px;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const PoolShare = styled(ChannelMetaBox)`
  background: #e20880;
  // background: #674c9f;
`;

const ButtonSpace = styled.div`
  width: 40%;
  align-items: center;
  margin: 1rem auto;
`;

const Space = styled.div`
  width: 100%;
  margin-bottom: 2rem;
  .bordered {
    display: flex;
    justify-content: center;
    border: 4px dotted #ccc;
    border-radius: 10px;
    padding: 6px;
    margin-top: 10px;
    .inner {
      margin-top: 0.25rem;
      text-align: center;
      padding: 10px;
      width: 100%;
      .crop-div {
        width: 100%;
        display: flex;
        flex-direction: row;
        @media (max-width: 768px) {
          flex-direction: column;
        }
        justify-content: space-evenly;
        align-items: center;
        margin-right: auto;
        div {
          .croppedImage {
            @media (max-width: 768px) {
              margin-top: 1rem;
            }
          }
        }
        .cropper {
          width: 250px;
          height: 250px;
        }
      }
      .check-space {
        .croppedImage {
          width: auto;
          height: auto;
          border-radius: 5px;
        }
        .button-space {
          margin-top: 1rem;
          width: 100%;
          display: flex;
          justify-content: center;
        }
      }
      .crop-button {
        display: flex;
        justify-content: center;
        width: 100%;
        @media (max-width: 768px) {
          margin-top: 1rem;
        }
      }
      .svg {
        margin: 0px auto;
        height: 3rem;
        width: 3rem;
        color: #ccc;
      }
      .text-div {
        display: flex;
        font-size: 1rem;
        line-height: 1rem;
        margin-top: 0.2rem;
        color: #ccc;
        justify-content: center;
        .labeled {
          position: relative;
          cursor: pointer;
          background-color: white;
          border-radius: 4px;
          color: #60a5fa;
        }
      }
      .text-below {
        font-size: 1rem;
        line-height: 1rem;
        color: #ccc;
        margin-top: 0.3rem;
      }
    }
  }
  .image-error {
    font-size: 1rem;
    line-height: 1rem;
    color: red;
    margin-top: 0.5rem;
  }
  .image {
    margin-top: 1rem;
    display: flex;
    flex-direction: row;
    .item {
      width: 4rem;
      height: auto;
      border-radius: 4px;
    }
    .image-border {
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      margin-left: 2rem;
      .text {
        font-size: 1rem;
        line-height: 1rem;
        color: #ccc;
        margin-top: 1rem;
      }
    }
  }
`;

const Field = styled.div`
  margin: 20px 0px 5px 0px;
  color: #4b5563;
  font-size: small;
  text-transform: uppercase;
`;

// Export Default
export default CreateChannel;