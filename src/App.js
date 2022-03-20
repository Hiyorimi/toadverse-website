import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Modal from "./components/Modal";
import twitterLogo from "./assets/svgviewer-output.svg";
import logoToadVerse from "./assets/tv_logo.svg";
import openseaLogo from "./assets/opensea-logo.png";
import Toadz from "./utils/0x49717D37804016f5bb64dF57f229BfBb640C6Ae2.json";
import "./App.css";

const TWITTER_HANDLE = "toadverseNFT";
const WEBSITE_URL = "https://toadverse.io";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = "https://opensea.io/collection/toadverse-0-by-nnn";
const NETWORK = "Polygon";
const NETWORK_VERSION = 137;
const SCANNER_LINK = "polygonscan.com"; // rinkeby.etherscan.io
const TOTAL_MINT_COUNT = 369;

const CONTRACT_ADDRESS = "0x49717D37804016f5bb64dF57f229BfBb640C6Ae2";

const App = () => {
  let totalMinted = 0;
  const [currentAccount, setCurrentAccount] = useState("");
  const [miningAnimation, setMiningAnimation] = useState(false);
  const [mintTotal, setMintTotal] = useState(totalMinted);
  const [currentNetwork, setCurrentNetwork] = useState("");
  const [isLoading, toggleIsLoading] = useState(false);

  const isOnCorrectNetwork = async () => {
    const chainId = await getNetwork();
    return chainId === NETWORK_VERSION;
  };

  const getNetwork = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const network = await provider.getNetwork();
    const chainId = network.chainId;

    return chainId;
  };

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have Metamask!");
      alert("Check your Metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
      console.log(ethereum.networkVersion, "window.ethereum.networkVersion");
    }
    try {
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
        setupEventListener();
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get Metamask!");
        return;
      }

      const isNetworkOk = await isOnCorrectNetwork();

      if (!isNetworkOk) {
        console.log(ethereum.networkVersion, "window.ethereum.networkVersion");
        console.log("Make sure you are on the correct network!");
        renderNetworkPrompt();
      } else {
        toggleIsLoading(true);
        const accounts = await ethereum.request({
          method: "eth_requestAccounts",
        });

        console.log("Connected", accounts[0]);
        setCurrentAccount(accounts[0]);
        toggleIsLoading(false);
        setupEventListener();
      }
    } catch (error) {
      toggleIsLoading(false);
      console.log(error);
    }
  };

  const setupEventListener = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          Toadz.abi,
          provider
        );

        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          alert(
            `Hey! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
          );
        });
        console.log("Setup event listener!");
      } else {
        console.log("Ethereum object doesn't exist");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const isNetworkOk = await isOnCorrectNetwork();
        if (!isNetworkOk) {
          console.log("Make sure you are on the correct network!");
          renderNetworkPrompt();
        } else {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const connectedContract = new ethers.Contract(
            CONTRACT_ADDRESS,
            Toadz.abi,
            signer
          );

          // console.log("Going to pop wallet now to pay gas...")
          let nftTxn = await connectedContract.mint(1, {
            value: 6900000000000000,
          });

          // console.log("Mining... please wait")
          setMiningAnimation(true);
          await nftTxn.wait();
          console.log(nftTxn);
          console.log(
            `Mined, tee transaction: https://${SCANNER_LINK}/tx/${nftTxn.hash}`
          );
          setMiningAnimation(false);
        }
      } else {
        console.log("Ethereum object doesn't exist");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    getTotalNFTsMintedSoFar();
  }, []);

  const renderNotConnectedContainer = () => (
    <button
      onClick={connectWallet}
      className={
        isLoading
          ? "cta-button button--loading"
          : "cta-button connect-wallet-button"
      }
    >
      <span class="button__text">Connect to Wallet</span>
    </button>
  );

  const renderMintUI = () => (
    <button
      onClick={askContractToMintNft}
      className={
        isLoading ? "cta-button button--loading" : "cta-button mint-button"
      }
    >
      <span class="button__text">Mint NFT</span>
    </button>
  );

  const renderNetworkPrompt = () =>
    alert(
      `Hello there, This app is built on the ${NETWORK} and it looks like you are on a different EVM network. Please switch to the ${NETWORK} to continue`
    );

  const getTotalNFTsMintedSoFar = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const connectedContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      Toadz.abi,
      provider
    );

    let count = await connectedContract.totalSupply();
    const total = parseInt(count._hex.substring(2), 16);
    console.log("minted", total);
    setMintTotal(total);
  };

  return (
    <div className="App">
      {miningAnimation ? <Modal /> : null}
      <div className="container">
        <div className="header-container">
          <div className="background-image"></div>
          <div className="logo_toadverse">
            <img src={logoToadVerse} alt="ToadVerse" />
          </div>
          <div className="social-links">
            <div className="social-link">
              <a
                className="opensea-button"
                href={TWITTER_LINK}
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src={twitterLogo}
                  alt="twitter-logo"
                  className="twitter-logo"
                />
                toadverseNFT
              </a>
            </div>
            <div className="social-link">
              <a
                className="opensea-button"
                href={OPENSEA_LINK}
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src={openseaLogo}
                  alt="opensea-logo"
                  className="opensea-logo"
                />
                OpenSea
              </a>
            </div>
            <div className="social-link">
              <a
                className="opensea-button"
                href="https://discord.gg/cryptoadz"
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src={require("./assets/discord-logo.png").default}
                  alt="discord-logo"
                  className="opensea-logo"
                />
                Discord
              </a>
            </div>
          </div>
          <div className="cta-block">
            <p className="header gradient-text">by NNN</p>
            <div className="sub-text benefit_1">
              <div style={{ fontSize: "2em" }}>{TOTAL_MINT_COUNT} toadz</div>
              are entering the portal
            </div>
            <div className="sub-text benefit_2">
              <div style={{ fontSize: "2em" }}>
                {mintTotal}/{TOTAL_MINT_COUNT}
              </div>
              NFTs made it through
            </div>
            <div className="cta-button-wrap">
              {currentAccount === ""
                ? renderNotConnectedContainer()
                : renderMintUI()}
            </div>
          </div>
        </div>

        <div id="faq" className="textBlock row">
          <div id="toadverseIntro" className="textBlockColumn">
            <div>
              <h1>Toadverse inhabitants</h1>
              <div>
                Spys among the highest ranks of the Evil King Gremplin sent the
                news of the upcoming invasion to the Uniswamp. Given the hint
                from Colonel Floorbin, Toad Rick opened the first portal into
                mysterious dimension of Polygon to ensuare preservation of the
                vibes. Colonel Rotebal Ganov was appointed to lead the first
                colonists. Many brave Cyrptoadz volunteered but only a few were
                selected to advance into the unknown world. Away from home they
                were the Toadversal insuarance to preserve the sacred !vibe.
              </div>
            </div>
          </div>
          <div id="imgGrid" className="textBlockColumn inhabitantsContainer">
            <div className="inhabitantsContainer">
              <div className="imgBox">
                <img
                  src={require("./assets/31.png").default}
                  alt="Toadverse inhabitant"
                />
              </div>
              <div className="imgBox i2">
                <img
                  src={require("./assets/74.png").default}
                  alt="Toadverse inhabitant"
                />
              </div>
              <div className="imgBox i3">
                <img
                  src={require("./assets/171.png").default}
                  alt="Toadverse inhabitant"
                />
              </div>
              <div className="imgBox i4">
                <img
                  src={require("./assets/506.png").default}
                  alt="Toadverse inhabitant"
                />
              </div>
            </div>
          </div>
        </div>
        <div id="about" className="textBlock row">
          <div className="textBlockColumn">
            <div id="nnn-collectiv-big">
              <img
                width="400"
                src={require("./assets/nnn_kolectiv.jpg").default}
                alt="nnn kolectiv"
              />
            </div>
          </div>
          <div className="textBlockColumn">
            <div>
              <h1>NNN</h1>
              On a Septemper of 2022, vibes were unsually strong. Those vibes
              reached the fabric of the Metaverse itself resulting in creation
              of something particular comfy and strange. NNN emerged as the
              Collective Unconsciousness living as the information flashes
              between the lines. As zeros hidden among ones.
            </div>
          </div>
        </div>
        <div className="textBlock row">
          <div className="textBlockColumn">
            <div>
              <h1>
                <span style={{ textDecoration: "line-through", opacity: 0.7 }}>
                  Toadmap
                </span>{" "}
                Vibemap
              </h1>
              No toadmap just vibes. That's why we have the Vibemap which is
              used to track how vibes radiate through Toadverse. First of all we
              plan on giving NFT-enthusiasts opportunity to explore different
              parallel chains by giving them limited free mints. Those explorers
              and researchers will receive generated Toadz or custom made Toadz,
              which will serve as a WL pass for the upcoming Mainnet drop.
              Timing is subject to change, we do enjoy gradually building the
              lore and have immence fun in the process.
            </div>
          </div>
          <div className="textBlockColumn" id="vibemap">
            <div id="nnn-collectiv-big">
              <img
                width="400"
                src={require("./assets/vibemap.jpg").default}
                alt="Vibemap"
              />
            </div>
            <div id="launch-timeline">
              <div>
                <strong>February:</strong> Polygon, Arbitrum
              </div>
              <div>
                <strong>~March:</strong> Fantom, Avax, zkSync, StarkNet
              </div>
              <div>
                <strong>Mainnet Drop:</strong> March-April
              </div>
            </div>
          </div>
        </div>
        <div id="team" className="text row">
          <h1>Made With Love,</h1>
          <div id="teamMembers">
            <div className="teamMember">
              <img
                className="teamImg"
                src={require("./assets/cryptoad_rick.jpg").default}
                alt="Toad Rick"
              />
              <div id="nameTag">Toad Rick</div>
            </div>
            <div className="teamMember">
              <img
                className="teamImg"
                src={require("./assets/rotebal_ganov.jpg").default}
                alt="Rotebal Ganov"
              />
              <div id="nameTag">Rotebal Ganov</div>
            </div>
            <div className="teamMember">
              <img
                className="teamImg"
                src={require("./assets/anon_serge.jpg").default}
                alt="Anon Serge"
              />
              <div id="nameTag">Anon Serge</div>
            </div>
            <div className="teamMember">
              <img
                className="teamImg"
                src={require("./assets/nnn_kolectiv.jpg").default}
                alt="NNN Collective"
              />
              <div id="nameTag">NNN Collective</div>
            </div>
          </div>
        </div>

        <div className="footer-container">
          <a
            className="pr-3"
            rel="noreferrer"
            target="_blank"
            href="http://creativecommons.org/publicdomain/zero/1.0/"
          >
            <img
              src="http://i.creativecommons.org/p/zero/1.0/88x31.png"
              alt="CC0"
            />
          </a>
          <div className="px-2">
            To the extent possible under law,
            <a rel="dct:publisher" href={WEBSITE_URL}>
              <span property="dct:title" className="px-1">
                &nbsp;NNN collective&nbsp;
              </span>
            </a>
            has waived all copyright and related or neighboring rights to
            <span property="dct:title" className="pl-1">
              &nbsp;Toadverse by NNN
            </span>
            . This work is published from:
            <span
              property="vcard:Country"
              datatype="dct:ISO4269"
              about={WEBSITE_URL}
              className="px-1"
            >
              &nbsp;Grempland
            </span>
            .
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
