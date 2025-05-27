import React from "react";
import { useForm } from "react-hook-form";
import { OpenC_backend } from "../../../declarations/OpenC_backend";
import { Principal } from "@dfinity/principal";
import Item from "./Item";

function Minter() {

  const { register, handleSubmit } = useForm();
  const [nftPrincipalId, setNftPrincipalId] = React.useState("");
  const[ishidden, sethidden] = React.useState(true);

  /* 
    * Function to handle new NFT submission form.
    * It retrieves the image and name from the form data and calls the backend funtion to mint the NFT.
    * After minting, it updates the state with the new NFT's principal ID.
  */
  const onSubmit = async (data) => {

    sethidden(false);
    const name = data.name;
    const image = data.image[0];
    const imageArrayBuffer = await image.arrayBuffer();
    const imageByteData = new Uint8Array(imageArrayBuffer);

    const newNFTID = await OpenC_backend.mint(imageByteData, name);
    setNftPrincipalId(newNFTID.toText());
    sethidden(true);

  };

  if (nftPrincipalId == "") {

    // If no NFT has been minted yet, shows the minting form
    return (
      <div className="minter-container">
        <div hidden={ishidden} className="lds-ellipsis">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
        <h3 className="makeStyles-title-99 Typography-h3 form-Typography-gutterBottom">
          Create NFT
        </h3>
        <h6 className="form-Typography-root makeStyles-subhead-102 form-Typography-subtitle1 form-Typography-gutterBottom">
          Upload Image
        </h6>
        <form className="makeStyles-form-109" noValidate="" autoComplete="off">
          <div className="upload-container">
            <input
              {...register("image", { required: true })}
              className="upload"
              type="file"
              accept="image/x-png,image/jpeg,image/gif,image/svg+xml,image/webp"
            />
          </div>
          <h6 className="form-Typography-root makeStyles-subhead-102 form-Typography-subtitle1 form-Typography-gutterBottom">
            Collection Name
          </h6>
          <div className="form-FormControl-root form-TextField-root form-FormControl-marginNormal form-FormControl-fullWidth">
            <div className="form-InputBase-root form-OutlinedInput-root form-InputBase-fullWidth form-InputBase-formControl">
              <input
                {...register("name", { required: true })}
                placeholder="e.g. CryptoDunks"
                type="text"
                className="form-InputBase-input form-OutlinedInput-input"
              />
              <fieldset className="PrivateNotchedOutline-root-60 form-OutlinedInput-notchedOutline"></fieldset>
            </div>
          </div>
          <div className="form-ButtonBase-root form-Chip-root makeStyles-chipBlue-108 form-Chip-clickable">
            <span onClick={handleSubmit(onSubmit)} className="form-Chip-label">Mint NFT</span>
          </div>
        </form>
      </div>
    );

  } else {

    // If an NFT has been minted, displays the NFT item
    return (
      <div className="minter-container">
        <h3 className="Typography-root makeStyles-title-99 Typography-h3 form-Typography-gutterBottom">
          Minted!
        </h3>
        <div className="horizontal-center">
        <Item nftid={nftPrincipalId} />
        </div>
      </div>
    );

  }
}
export default Minter;
