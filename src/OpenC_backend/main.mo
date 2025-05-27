import Principal "mo:base/Principal";
import NFTActorClass "../NFT/nft";
import Cycles "mo:base/ExperimentalCycles";
import Debug "mo:base/Debug";
import List "mo:base/List";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";

/*  
  * OpenC - A decentralized NFT marketplace on the Internet Computer
  * This canister allows users to mint, list, and purchase NFTs.
  * It maintains a mapping of NFTs, their owners, and NFT listings on OpenC for buying.
*/

actor OpenC{

  // Listing structure to hold the NFT id and price of an NFT
  private type Listing={
    id: Principal;
    price: Nat;
  };

  // Maps to store NFT details, Key: NFT canister ID, Value: NFT object(owner id, price and image data)
  var mapOfNFTs = HashMap.HashMap<Principal, NFTActorClass.NFT>(1, Principal.equal, Principal.hash);

  // Maps NFT IDs to their owners, Key: Owner ID, Value: list of Principals id of NFT
  var mapOfOwners = HashMap.HashMap<Principal, List.List<Principal>>(1, Principal.equal, Principal.hash);

  // Listings NFTs for sale on OpenC, Key: Canister ID and value: Listing object(owner id and price)
  var mapOfListings = HashMap.HashMap<Principal, Listing>(1, Principal.equal, Principal.hash);



  /* 
    * Function to mint a new NFT
    * It takes image data, owner id and NFT name for the NFT, and returns the canister ID of the newly created NFT
  */
  public shared(msg) func mint(imageData: [Nat8], name: Text):async Principal{

    let owner : Principal = msg.caller;

    Debug.print(debug_show(Cycles.balance()));
    let newNFT = await (with cycles = 900_000_000_000)NFTActorClass.NFT(name,owner, imageData);
    Debug.print(debug_show(Cycles.balance()));

    let canisterId = await newNFT.getCanisterId();
    mapOfNFTs.put(canisterId, newNFT);
    addToOwnershipMap(owner, canisterId);
    return canisterId;

  };


  /* 
    * Function to add the NFT to the ownership map
    * It takes the owner and the NFT Canister ID, and adds the NFT ID to the list of NFTs owned by that owner
   */
  private func addToOwnershipMap(owner: Principal, nftId: Principal) {

        // Check if the owner already exists in the map
        var ownedNFTs : List.List<Principal> = switch (mapOfOwners.get(owner)) {
          case null List.nil<Principal>();
          case (?result) result;
        };

        ownedNFTs := List.push(nftId, ownedNFTs);
        mapOfOwners.put(owner, ownedNFTs);

    };


    /* 
      * Function to get the list of NFTs owned by a user
    */
    public query func getOwnedNFTs(user: Principal) : async [Principal] {

      var userNFTs : List.List<Principal> = switch (mapOfOwners.get(user)) {
        case null List.nil<Principal>();
        case (?result) result;
      };

      return List.toArray(userNFTs);

    };


    /* 
      * Function to get the list of all NFTs listed for sale on OpenC
      * It returns an array of Principal IDs representing the listed NFTs
    */
    public query func getListedNFTs(): async [Principal] {

      let listedNFTs = Iter.toArray(mapOfListings.keys());
      return listedNFTs;
      

    };


    /* 
      * Function to get the details of specific NFTs being listed for sale on OpenC
      * It list the NFT on OpenC marketplace with the owner id and price
    */
    public shared(msg) func listItems(id: Principal, price: Nat):async Text {

      // Check if the NFT exists in the map
      var item : NFTActorClass.NFT = switch (mapOfNFTs.get(id)) {
        case null return "NFT not found";
        case (?result) result;
      };

      let owner = await item.getOwner();
      // Check if the caller is the owner of the NFT
      if(Principal.equal(owner, msg.caller)){
        let newListing : Listing = {
        id = owner;
        price = price;
        };
        mapOfListings.put(id, newListing);
      return "Success";
      }
      else{
        return "You are not the owner of this NFT";
      }

    };


    /* 
      * Function to get the OpenC canister ID
    */
    public query func getOpenCCanisterId(): async Principal {

      return Principal.fromActor(OpenC);

    };


    /* 
      * Function to check if an NFT is listed for sale on OpenC
    */
    public query func isListed(id: Principal): async Bool {

      if(mapOfListings.get(id) == null){
        return false;
      } else {
        return true;
      }


    };

    /* 
      * Function to get the original owner of an NFT
      * It returns the Principal ID of the original owner of the NFT
    */
    public query func getOriginalOwner(id: Principal): async Principal {

      var item : Listing = switch (mapOfListings.get(id)) {
        case null return Principal.fromText("");
        case (?result) result;
      };
      return item.id;

    };

 
    /* 
      * Function to get the price of an NFT listed for sale on OpenC
    */
    public query func getListedNFTPrice(id: Principal): async Nat {

      var item : Listing = switch (mapOfListings.get(id)) {
        case null return 0;
        case (?result) result;
      };
      return item.price;

    };

 
    /* 
      * Function to purchase an NFT listed for sale on OpenC
      * It transfers the ownership of the NFT to the new owner and updates the ownership map
    */
    public shared(msg) func completePurchase(id :Principal, ownerId :Principal, newOwnerId: Principal):async Text{
      
      // Check if the NFT exist in the map
      var purchasedNFT : NFTActorClass.NFT = switch (mapOfNFTs.get(id)) {
        case null return "NFT not found";
        case (?result) result;
      };

      let transferResult = await purchasedNFT.transferOwnership(newOwnerId);
      if (transferResult != "Success") {
        mapOfListings.delete(id);

        var ownedNFTs : List.List<Principal> = switch (mapOfOwners.get(ownerId)) {
          case null List.nil<Principal>();
          case (?result) result;
        };
        ownedNFTs := List.filter(ownedNFTs, func(nftId : Principal) :Bool { return nftId != id });
        addToOwnershipMap(newOwnerId, id);
        return "Success";
      }else {
        return "Transfer failed";
      }
      
    };

};
