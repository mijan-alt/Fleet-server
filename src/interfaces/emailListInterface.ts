import { Document } from "mongodb";
import { Types } from "mongoose";

interface EmailListInterface extends Document {
    listName: string;
    listDescription: string;
    listCategory: string;
    listStatus: string;
    listData: object[];
    listBusinessId: Types.ObjectId;
}

export {
 EmailListInterface
};

