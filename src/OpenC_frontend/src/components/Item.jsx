import React, { useEffect } from "react";
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from "../../../declarations/nft";
import { idlFactory as tokenIdlFactory } from "../../../declarations/trl_backend";
import Button from "./Button";
import { OpenC_backend } from "../../../declarations/OpenC_backend";
import CURRENT_USER_ID from "../main";
import PriceLabel from "./PriceLabel";
import { Principal } from "@dfinity/principal";


function Item(props) {

  const id = props.nftid;
  const localhost = "http://localhost:4943";
  const agent = new HttpAgent({
    host: localhost,
  });
  let nftActor;
  const [name, setName] = React.useState("");
  const [owner, setOwner] = React.useState("")
  const [image, setImage] = React.useState("");
  const [button, setButton] = React.useState(<></>);
  const [priceInput, setPriceInput] = React.useState();
  const [isHidden, setIsHidden] = React.useState(true);
  const [blurFilter, setBlur] = React.useState("none");
  const [sellStatus, setSellStatus] = React.useState("");
  const [priceLabel, setPriceLabel] = React.useState();
  const [shouldDisplay, setShouldDisplay] = React.useState(true);

  /* 
    * This function loads the NFT data from the canister.
    * It fetches the name, owner, and image asset of the NFT.
    * It also checks if the NFT is listed on the OpenC marketplace and sets the appropriate button and status.
  */
  async function loadNFT() { 

    nftActor = Actor.createActor(idlFactory, {
      agent,
      canisterId: id,
    });

    // Only fetch root key in development/local
    if (process.env.NODE_ENV !== "production") {
      await agent.fetchRootKey(); // 👈 This is required for local testing
    }

    let name = await nftActor.getName();
    setName(name.toString());
    // console.log(name);

    let owner = await nftActor.getOwner();
    setOwner(owner.toString());
    // console.log(owner);

    let image = await nftActor.getAssets();
    // console.log("Image asset:", image, typeof image);

  // Only to use when loading example NFT from the README.md file
  /*
    // Step 1: Convert Uint8Array to string
    const textDecoder = new TextDecoder("utf-8");
    const decodedString = textDecoder.decode(image);

    // Step 2: Extract numbers from the string "vec {137; 80; 78; ...}"
    const match = decodedString.match(/vec\s*\{([^}]*)\}/);
    const numberString = match ? match[1] : "";
    const numberArray = numberString
      .split(";")
      .map(s => parseInt(s.trim()))
      .filter(n => !isNaN(n)); 
  */

    

    // When loading the example NFT from the README.md file, uncomment the below line:
    // let imageData = new Uint8Array(numberArray);
    
    let imageData = new Uint8Array(image);
    let imageUrl = URL.createObjectURL(new Blob([imageData.buffer], { type: "image/png" }));
    setImage(imageUrl);

    // For MyNFTs Gallery, identified by role = collection
    if (props.role == "collection") {

      const nftIsListed = await OpenC_backend.isListed(id);
      if (nftIsListed) { 
        setOwner("OpenC Marketplace");
        setBlur({ filter: "blur(10px)" });
        setSellStatus("Listed");
      } else {
        setButton(<Button handleClick={ handleSell} text="Sell" />);
      } 

    } else if (props.role == "discover") { // For MyNFTs Gallery, identified by role = discover

      const originalOwner = await OpenC_backend.getOriginalOwner(id);
      if (originalOwner.toString()!= CURRENT_USER_ID.toString()) {
        setButton(<Button handleClick={ handleBuy} text="Buy" />)
      }
      const NFTListedPrice = await OpenC_backend.getListedNFTPrice(id);
      setPriceLabel(<PriceLabel sellPrice={NFTListedPrice.toString()} />);

    }
    
  };

  let price;
  /* 
    * This function handles the click event for the Sell button.
    * It sets the price input field and changes the button to a Confirm button.
    * When the Confirm button is clicked, it calls the sellItem function to list the NFT on OpenC.
  */
  function handleSell() {
    
    setPriceInput(<input
      placeholder="Price in TRL"
      type="number"
      className="price-input"
      value={price}
      onChange={(e) => price = e.target.value}
    />);
    setButton(<Button handleClick={sellItem} text="Confirm" />);
    
  }

  /* 
   * This function lists the NFT on OpenC marketplace.
   * It calls the OpenC_backend.listItems function with the NFT ID and price.
   * If the listing is successful, it transfers ownership of the NFT to the OpenC canister.
   * It also updates the UI to reflect the new owner and status.
  */
  async function sellItem() { 

    setIsHidden(false);
    setBlur({ filter: "blur(10px)" });
    console.log("Sell item clicked with price:");
    let listingResult = await OpenC_backend.listItems(id, Number(price));
    console.log("Listing result:", listingResult);
    if (listingResult == "Success") {
      
      const openCId = await OpenC_backend.getOpenCCanisterId();
      const transferResult = await nftActor.transferOwnership(openCId);
      console.log("Transfer result:", transferResult);

      if( transferResult == "Success") {
        setIsHidden(true);
        setButton();
        setPriceInput();
        setOwner("OpenC Marketplace");
        setSellStatus("Listed");
      }

    }

  };

  /* 
    * This function handles the click event for the Buy button.
    * It retrieves the original owner and price of the NFT from OpenC_backend.
    * It then transfers the TRL tokens from the current user to the seller.
    * If the transfer is successful, it completes the purchase on OpenC_backend.
  */
  async function handleBuy() {

    /* 
      Note: Buy button will only show up if the NFT is not owned by the current user.
            But when in local environment, the current user is always the original owner.
            So, buy button won't show up in local environment. For testing purposes,
            use the exaple from the README.md file.
    */
    setIsHidden(false);
    const tokenActor = Actor.createActor(tokenIdlFactory, {
      agent,
      canisterId: Principal.fromText("ulvla-h7777-77774-qaacq-cai"), // Replace with the actual TRL canister ID
    });
    const sellerid = await OpenC_backend.getOriginalOwner(id);
    const price = await OpenC_backend.getListedNFTPrice(id);

    const result = await tokenActor.transferTo(sellerid, price);
    if (result == "Success") {

      const transferResult = await OpenC_backend.completePurchase(id, sellerid, CURRENT_USER_ID);
      console.log("Transfer result:", transferResult);
      setIsHidden(true);
      setShouldDisplay(false);
      
    }
    
  };


  useEffect(() => {
    loadNFT();
  },[])

  return (

    <div style={{display: shouldDisplay? "inline" : "none"}} className="disGrid-item">
      <div className="disPaper-root disCard-root makeStyles-root-17 disPaper-elevation1 disPaper-rounded">
        <img
          className="disCardMedia-root makeStyles-image-19 disCardMedia-media disCardMedia-img"
          src={image}
          style={{blurFilter}}
        />
        {/* Loading Animation */}
        <div className="lds-ellipsis" hidden={isHidden}>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div className="disCardContent-root">
          {priceLabel}
          <h2 className="disTypography-root makeStyles-bodyText-24 disTypography-h5 disTypography-gutterBottom">
            {name}<span className="purple-text"> {sellStatus} </span>
          </h2>
          <p className="disTypography-root makeStyles-bodyText-24 disTypography-body2 disTypography-colorTextSecondary">
            Owner: {owner}
          </p>
          {priceInput}
          {button}
        </div>
      </div>
    </div>
  );

}

export default Item;
