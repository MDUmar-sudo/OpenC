import React, { useEffect } from "react";
import logo from "/logo.png";
import homeImage from "/home-img.png";
import { BrowserRouter, Link,Routes , Route } from "react-router-dom";
import Minter from "./Minter";
import Gallery from "./Gallery";
import CURRENT_USER_ID from "../main";
import { OpenC_backend } from "../../../declarations/OpenC_backend";

function Header() {

  // State to change the gallery(MyNFTs)
  const [userOwnedGallery, setGallery] = React.useState();

  // State to change the gallery(Discover)
  const [listingGallery, setListingGallery] = React.useState();

  async function getNFTs() {

    // Fetch the NFTs owned by the current user and set the MyNFTs gallery
    const nfts = await OpenC_backend.getOwnedNFTs(CURRENT_USER_ID);
    setGallery(<Gallery title="My NFTs" ids={nfts} role="collection"/>);

    // Fetch the NFTs that are listed for sale and set the Discover gallery
    const listedNFTids = await OpenC_backend.getListedNFTs();
    setListingGallery(<Gallery title="Discover" ids={listedNFTids} role="discover" />);
    
  }

  useEffect(() => {
    getNFTs();
  }, []);

  return (
    <BrowserRouter forceRefresh={true}>
    <div className="app-root-1">
      <header className="Paper-root AppBar-root AppBar-positionStatic AppBar-colorPrimary Paper-elevation4">
        <div className="Toolbar-root Toolbar-regular header-appBar-13 Toolbar-gutters">
          <div className="header-left-4"></div>
          <img className="header-logo-11" src={logo} />
            <div className="header-vertical-9"></div>
            <Link to="/">
              <h5 className="Typography-root header-logo-text">OpenC</h5>
            </Link>
          <div className="header-empty-6"></div>
          <div className="header-space-8"></div>
            <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
              <Link to="/discover">
                Discover
                </Link>
          </button>
            <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
              <Link to="/minter">
              Minter
              </Link>
          </button>
            <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
              <Link to="/collection">
              My NFTs
              </Link>
          </button>
        </div>
      </header>
      </div>
      <Routes>
        <Route exact path="/" element={<img className="bottom-sapce" src={homeImage}/>}/>
        <Route path="/discover" element={listingGallery}/>
        <Route path="/minter" element={<Minter />}/>
        <Route path="/collection" element={userOwnedGallery}/>
      </Routes>
      </BrowserRouter>
  );

}

export default Header;
