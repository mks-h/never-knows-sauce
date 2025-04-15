import { BaseModel, LocalizationEntry } from "./index.ts";
import { LocalizationEntrySchema } from "./LocalizationEntry.ts";
import { Schema } from "npm:mongoose";

export type ApplicationModels = "LocalizationEntry";

export const ApplicationSchemas: { [key in ApplicationModels]: Schema } = {
	LocalizationEntry: LocalizationEntrySchema,
};

export type ModelType<T extends ApplicationModels> = T extends
	"LocalizationEntry" ? LocalizationEntry : BaseModel;
