import { Schema } from "npm:mongoose";
import { BaseModel, BaseSchema } from "./BaseModel.ts";

export interface LocalizationEntry extends BaseModel {
  path: string;
  localization: string;
  locale: string;
}

export const LocalizationEntrySchema = new Schema(
  {
    path: { type: String, required: true },
    localization: { type: String, required: true, index: true },
    locale: { type: String, required: true, index: true },
  },
  { timestamps: true, collection: "localizations" }
).add(BaseSchema);
