import Debug "mo:base/Debug";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Nat8 "mo:base/Nat8";

/* 
    * This is a simple NFT actor class that represents a Non-Fungible Token (NFT).
    * It includes methods to get the NFT's name, owner, assets, canister ID, and to transfer ownership.
    * The NFT is represented by its name, owner, and content (image bytes).
*/
 actor class NFT(name:Text, owner:Principal,content:[Nat8])= this {
        private let itemName = name;
        private var nftOwner = owner;
        private let imageBytes = content;

        // Returns the NFT name
        public query func getName() : async Text {
            return itemName;
        };

        // Returns the NFT owner's name
        public query func getOwner() : async Principal {
            return nftOwner;
        };

        // Returns the NFT image bytes
        public query func getAssets() : async [Nat8] {
            return imageBytes;
        };

        // Returns the NFT canister ID, this is the ID of the canister that holds this NFT
        public query func getCanisterId() : async Principal {
            return Principal.fromActor(this);
        };

        // Transfers ownership of the NFT to a new owner
        public shared(msg) func transferOwnership(newOwner: Principal) : async Text {
            if (msg.caller == nftOwner) {
                nftOwner := newOwner;
                return "Success";
            } else {
                return "Error: Only the current owner can transfer ownership";
            }
        }; 
    
 };