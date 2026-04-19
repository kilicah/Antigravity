"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function createCompany(formData: FormData) {
  // Universal
  const codeRaw = formData.get("code") as string;
  const code = codeRaw ? codeRaw.toUpperCase().substring(0, 10) : null;

  // Turkish Fields
  const name = (formData.get("name") as string)?.toLocaleUpperCase("tr-TR");
  const address = (formData.get("address") as string)?.toLocaleUpperCase("tr-TR");
  const district = (formData.get("district") as string)?.toLocaleUpperCase("tr-TR");
  const city = (formData.get("city") as string)?.toLocaleUpperCase("tr-TR");
  const country = (formData.get("country") as string)?.toLocaleUpperCase("tr-TR");
  const taxOffice = (formData.get("taxOffice") as string)?.toLocaleUpperCase("tr-TR");
  
  // English Fields
  const nameEn = (formData.get("nameEn") as string)?.toUpperCase();
  const addressEn = (formData.get("addressEn") as string)?.toUpperCase();
  const districtEn = (formData.get("districtEn") as string)?.toUpperCase();
  const cityEn = (formData.get("cityEn") as string)?.toUpperCase();
  const countryEn = (formData.get("countryEn") as string)?.toUpperCase();
  const taxOfficeEn = (formData.get("taxOfficeEn") as string)?.toUpperCase();

  // Universal
  const zipCode = formData.get("zipCode") as string;
  const taxNo = formData.get("taxNo") as string;
  const registrationNo = (formData.get("registrationNo") as string)?.toLocaleUpperCase("tr-TR");
  const phone = formData.getAll("phone").filter(Boolean).join(", ");
  const email = (formData.get("email") as string)?.toLowerCase();
  
  // Roles
  const isSeller = formData.get("isSeller") === "on";
  const isBuyer = formData.get("isBuyer") === "on";
  const isShipTo = formData.get("isShipTo") === "on";
  const isBrand = formData.get("isBrand") === "on";
  const isCustoms = formData.get("isCustoms") === "on";
  const isLogistics = formData.get("isLogistics") === "on";
  const isInsurance = formData.get("isInsurance") === "on";
  const isAgency = formData.get("isAgency") === "on";
  const isActive = formData.get("isActive") === "on";

  // Representatives array
  const repsJson = (formData.get("repsJson") as string) || "[]";
  
  // Delivery Addresses
  const deliveryAddressesJson = (formData.get("deliveryAddressesJson") as string) || "[]";

  await prisma.company.create({
    data: {
      code,
      name,
      nameEn: nameEn || null,
      address,
      addressEn: addressEn || null,
      district,
      districtEn: districtEn || null,
      city,
      cityEn: cityEn || null,
      country,
      countryEn: countryEn || null,
      zipCode,
      taxOffice,
      taxOfficeEn: taxOfficeEn || null,
      taxNo,
      registrationNo,
      phone,
      // @ts-ignore
      email: email || null,
      isSeller,
      isBuyer,
      isShipTo,
      isBrand,
      isCustoms,
      isLogistics,
      isInsurance,
      isAgency,
      isActive,
      repsJson,
      deliveryAddressesJson,
    },
  });

  redirect("/companies");
}

export async function updateCompany(companyId: number, formData: FormData) {
  // Universal
  const codeRaw = formData.get("code") as string;
  const code = codeRaw ? codeRaw.toUpperCase().substring(0, 10) : null;

  // Turkish Fields
  const name = (formData.get("name") as string)?.toLocaleUpperCase("tr-TR");
  const address = (formData.get("address") as string)?.toLocaleUpperCase("tr-TR");
  const district = (formData.get("district") as string)?.toLocaleUpperCase("tr-TR");
  const city = (formData.get("city") as string)?.toLocaleUpperCase("tr-TR");
  const country = (formData.get("country") as string)?.toLocaleUpperCase("tr-TR");
  const taxOffice = (formData.get("taxOffice") as string)?.toLocaleUpperCase("tr-TR");
  
  // English Fields
  const nameEn = (formData.get("nameEn") as string)?.toUpperCase();
  const addressEn = (formData.get("addressEn") as string)?.toUpperCase();
  const districtEn = (formData.get("districtEn") as string)?.toUpperCase();
  const cityEn = (formData.get("cityEn") as string)?.toUpperCase();
  const countryEn = (formData.get("countryEn") as string)?.toUpperCase();
  const taxOfficeEn = (formData.get("taxOfficeEn") as string)?.toUpperCase();

  // Universal
  const zipCode = formData.get("zipCode") as string;
  const taxNo = formData.get("taxNo") as string;
  const registrationNo = (formData.get("registrationNo") as string)?.toLocaleUpperCase("tr-TR");
  const phone = formData.getAll("phone").filter(Boolean).join(", ");
  const email = (formData.get("email") as string)?.toLowerCase();
  
  // Roles
  const isSeller = formData.get("isSeller") === "on";
  const isBuyer = formData.get("isBuyer") === "on";
  const isShipTo = formData.get("isShipTo") === "on";
  const isBrand = formData.get("isBrand") === "on";
  const isCustoms = formData.get("isCustoms") === "on";
  const isLogistics = formData.get("isLogistics") === "on";
  const isInsurance = formData.get("isInsurance") === "on";
  const isAgency = formData.get("isAgency") === "on";
  const isActive = formData.get("isActive") === "on";

  // Representatives array
  const repsJson = (formData.get("repsJson") as string) || "[]";
  
  // Delivery Addresses
  const deliveryAddressesJson = (formData.get("deliveryAddressesJson") as string) || "[]";

  const dataPayload = {
      code,
      name,
      nameEn: nameEn || null,
      address,
      addressEn: addressEn || null,
      district,
      districtEn: districtEn || null,
      city,
      cityEn: cityEn || null,
      country,
      countryEn: countryEn || null,
      zipCode,
      taxOffice,
      taxOfficeEn: taxOfficeEn || null,
      taxNo,
      registrationNo,
      phone,
      // @ts-ignore
      email: email || null,
      isSeller,
      isBuyer,
      isShipTo,
      isBrand,
      isCustoms,
      isLogistics,
      isInsurance,
      isAgency,
      isActive,
      repsJson,
      deliveryAddressesJson,
    };

  try {
    await prisma.company.update({
      where: { id: companyId },
      data: dataPayload,
    });
  } catch(error: any) {
    console.error("PRISMA UPDATE ERROR DETAILS:", error.message);
    console.error("FAILED PAYLOAD:", JSON.stringify(dataPayload, null, 2));
    throw error;
  }

  redirect("/companies");
}
