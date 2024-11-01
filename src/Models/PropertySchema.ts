
import mongoose, { Schema, Document } from "mongoose";

export interface IProperty extends Document {
  title: string;
  description: string;
  price: number;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  amenities: string[];
  images: string[];
  features: {
    parking?: boolean;
    airConditioning?: boolean;
    heating?: boolean;
    laundry?: boolean;
  };
  availability: {
    availableFrom: Date;
    isAvailable: boolean;
  };
  lister: {
    type: string;
    fullname: string;
    email?: string;
    licenseNumber?:string
  };
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema = new Schema<IProperty>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    propertyType: { type: String, required: true },
    bedrooms: { type: Number, required: true },
    bathrooms: { type: Number, required: true },
    squareFeet: { type: Number, required: true },
    amenities: [{ type: String }],
    images: [{ type: String }],
    features: {
      parking: Boolean,
      airConditioning: Boolean,
      heating: Boolean,
      laundry: Boolean,
    },
    availability: {
      availableFrom: { type: Date, default: Date.now },
      isAvailable: { type: Boolean, default: true },
    },
     lister: {
       type:{type:String},
      fullname: { type: String, required: true },
      email: { type: String, required: true },
      phone: String,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for common queries
PropertySchema.index({ "location.city": 1, "location.state": 1 });
PropertySchema.index({ price: 1 });
PropertySchema.index({ propertyType: 1 });
PropertySchema.index({ "availability.isAvailable": 1 });

const Property = mongoose.model<IProperty>("Property", PropertySchema);

export default Property
