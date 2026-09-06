import { z } from "zod";

export const shippingSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required."),
  lastName: z.string().trim().min(1, "Last name is required."),
  email: z.string().trim().email("Enter a valid email address."),
  address: z.string().trim().min(1, "Street address is required."),
  city: z.string().trim().min(1, "City is required."),
  postalCode: z.string().trim().min(1, "Postal/ZIP code is required."),
  phone: z.string().trim().min(7, "Enter a valid phone number."),
});

export const reviewSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  rating: z.number().int().min(1, "Select a star rating."),
  comment: z.string().trim().min(5, "Review must be at least 5 characters."),
});

export const authSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export const signupSchema = authSchema.extend({
  name: z.string().trim().min(1, "Full name is required."),
  confirmPassword: z.string().min(1, "Please confirm your password."),
}).refine((values) => values.password === values.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match.",
});
