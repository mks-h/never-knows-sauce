import { Schema } from "npm:mongoose";

export interface BaseModel {
  id: string;
  createdAt: number;
  updatedAt: number;
}

export const BaseSchema = new Schema(
  {
    createdAt: { type: Date, required: true, default: Date.now() },
    updatedAt: { type: Date, required: true, default: Date.now() },
  },
  {
    versionKey: false,
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
      getters: true,
    },
  }
);

BaseSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

BaseSchema.pre("save", function (next) {
  this.set("updatedAt", Date.now());

  next();
});
