//import { Web3Provider } from "@ethersproject/providers";
import { BrowserProvider } from "ethers";

export interface IGlobalContext {
  isSidebarOpen: boolean;
  setSidebarOpen: (isSidebarOpen: boolean) => void;
  isRightPanelOpen: boolean;
  setisRightPanelOpen: (isSidebarOpen: boolean) => void;
  isMoved: boolean;
  setisMoved: (isSidebarOpen: boolean) => void;
  address: string | null;
  imageURL: string | null;
  setimageURL: (imageURL: string) => void,
  accessToken: string | null;
  primaryProfile: IPrimaryProfileCard | null;
  profileCount: number;
  postCount: number;
  posts: IPostCard[];
  postList: IPosts[] | null,
  setPostList: (postList: IPosts[] | null) => void,
  profiles: IAccountCard[];
  ranking: any[] | null,
  indexingProfiles: IAccountCard[];
  indexingPosts: IPostCard[];
  setAddress: (address: string | null) => void;
  setAccessToken: (accessToken: string | null) => void;
  setPrimaryProfile: (primaryProfile: IPrimaryProfileCard | null) => void;
  setProfileCount: (profileCount: number) => void;
  setPostCount: (postCount: number) => void;
  setPosts: (posts: IPostCard[]) => void;
  postInput: IPostInput;
  setPostInput: (postInput: IPostInput) => void;
  setProfiles: (profiles: IAccountCard[]) => void;
  setIndexingProfiles: (indexingProfiles: IAccountCard[]) => void;
  setIndexingPosts: (indexingPosts: IPostCard[]) => void;
  connectWallet: () => Promise<BrowserProvider>;
  checkNetwork: (provider: BrowserProvider) => Promise<void>;
}

export interface IModalContext {
  modal: boolean;
  modalType: string | null;
  modalText: string;
  handleModal: (type: string | null, text: string) => void;
}

/* Metadata schema for Profile NFT */
export interface IProfileMetadata {
  name: string;
  bio: string;
  handle: string;
  version: string;
}

/* Metadata schema for Essence NFT */
interface Media {
  /* The MIME type for the media */
  media_type: string;
  /* The URL link for the media */
  media_url: string;
  /* Alternative text when media can't be rendered */
  alt_tag?: string;
  /* The preview image for the media */
  preview_image_url?: string;
}

interface Attribute {
  /* Field indicating how you would like it to be displayed */
  /* optional if the trait_type is string */
  display_type?: string;
  /* Name of the trait */
  trait_type: string;
  /* Value of the trait */
  value: number | string;
}

export interface IEssenceMetadata {
  /* ~~ REQUIRED ~~ */
  /* Unique id for the issued item */
  metadata_id: string;

  /* Version of the metadata schema used for the issued item. */
  version: string;

  /* ~~ OPTIONAL ~~ */
  /* Id of the application under which the items are being minted. */
  app_id?: string;

  /* Language of the content as a BCP47 language tag. */
  lang?: string;

  /* Creation time of the item as ISO 8601. */
  issue_date?: string;

  /* The content associated with the item */
  content?: string;

  /* Media refers to any image, video, or any other MIME type attached to the content.
    Limited to max. 10 media objects. */
  media?: Media[];

  /* Field indicating the tags associated with the content. Limited to max. 5 tags. */
  tags?: string[];

  /* ~~ OPENSEA (optional) ~~ */
  /* URL to the image of the item. */
  image?: string;

  /* SVG image data when the image is not passed. Only use this if you're not 
    including the image parameter. */
  image_data?: string;

  /* Name of the item. */
  name?: string;

  /* Description of the item. */
  description?: string;

  /* URL to a multi-media attachment for the item. */
  animation_url?: string;

  /* Attributes for the item. */
  attributes?: Attribute[];

  /* URL to the item on your site. */
  external_url?: string;
}

export interface IProfileCard {
  handle: string;
  avatar: string;
  metadata: string;
  profileID: number;
  isSubscribedByMe: boolean;
}

export interface IPostCard {
  createdBy: {
    handle: string;
    avatar: string;
    metadata: string;
    profileID: number;
    owner: {
      address: string;
      primaryProfile: {
        isSubscribedByMe: boolean;
      };
    };
  };
  essenceID: number;
  tokenURI: string;
  isCollectedByMe: boolean;
  isIndexed?: boolean;
}

export interface IEssenceMwCard {
  essence: {
    essenceID: number;
    tokenURI: string;
  };
  selectedEssenceContent: string;
  setSelectedEssence: (essence: {
    essenceID: number;
    tokenURI: string;
  }) => void;
  setSelectedEssenceContent: (selectedEssenceContent: string) => void;
  setShowDropdown: (showDropdown: boolean) => void;
}

export interface IProfileMwCard {
  profileID: number;
  metadata: string;
  selectedProfileHandle: string;
  setSelectedProfileId: (profileID: number) => void;
  setSelectedProfileHandle: (selectedProfileHandle: string) => void;
  setShowDropdown: (showDropdown: boolean) => void;
}

export interface IAccountCard {
  profileID: number;
  handle: string;
  avatar: string;
  metadata: string;
  isPrimary?: boolean;
  isIndexed?: boolean;
}

export interface ISignupInput {
  name: string;
  bio: string;
  handle: string;
  avatar: string;
  operator: string;
}

export interface IPostInput {
  nftMedia: string,
  content: string,
  privacy: string,
  description: string
}

export interface IPrimaryProfileCard {
  profileID: number;
  handle: string;
  avatar: string;
  metadata: string;
}
export interface IPosts {
  content: string,
  description: string,
  image_data: string,
  tags: string[],
  issue_date: string,
  name: string,
  handle: string,
  bio: string,
  avatar: string,
  essenceID: number
}