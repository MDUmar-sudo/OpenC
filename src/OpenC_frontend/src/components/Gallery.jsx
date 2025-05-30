import React, { useEffect } from "react";
import Item from "./Item";
import { Principal } from "@dfinity/principal";

function Gallery(props) {

  const [items, setItems] = React.useState();

  function loadNFT() { 

    if (props.ids != undefined) {
      setItems(props.ids.map((nftid) => 
        <Item key={nftid.toText()} nftid={nftid} role={ props.role} />
      ));
    }
    
  }

  useEffect(() => {
    loadNFT();
  },[])

  return (
    <div className="gallery-view">
      <h3 className="makeStyles-title-99 Typography-h3">{props.title }</h3>
      <div className="disGrid-root disGrid-container disGrid-spacing-xs-2">
        <div className="disGrid-root disGrid-item disGrid-grid-xs-12">
          <div className="disGrid-root disGrid-container disGrid-spacing-xs-5 disGrid-justify-content-xs-center">
            {items}
            </div>
        </div>
      </div>
    </div>
  );
}

export default Gallery;
