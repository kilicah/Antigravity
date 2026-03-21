"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function createCompany(formData: FormData) {
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
  const phone = formData.get("phone") as string;
  
  // Roles
  const isSeller = formData.get("isSeller") === "on";
  const isBuyer = formData.get("isBuyer") === "on";
  const isShipTo = formData.get("isShipTo") === "on";
  const isBrand = formData.get("isBrand") === "on";
  const isCustoms = formData.get("isCustoms") === "on";
  const isLogistics = formData.get("isLogistics") === "on";
  const isInsurance = formData.get("isInsurance") === "on";
  const isAgency = formData.get("isAgency") === "on";

  // Build 10 Representatives array
  const representatives = [];
  for (let i = 1; i <= 10; i++) {
     const repName = (formData.get(`rep${i}_name`) as string)?.toLocaleUpperCase("tr-TR");
     const repNameEn = (formData.get(`rep${i}_nameEn`) as string)?.toUpperCase();
     const repTitle = (formData.get(`rep${i}_title`) as string)?.toLocaleUpperCase("tr-TR");
     const repPhone = formData.get(`rep${i}_phone`) as string;
     const repEmail = formData.get(`rep${i}_email`) as string;
     
     if (repName || repNameEn || repTitle || repPhone || repEmail) {
       representatives.push({
          name: repName || "",
          nameEn: repNameEn || "",
          title: repTitle || "",
          phone: repPhone || "",
          email: repEmail || "",
       });
     }
  }
  const repsJson = JSON.stringify(representatives);
  
  // Delivery Addresses
  const deliveryAddressesJson = (formData.get("deliveryAddressesJson") as string) || "[]";

  await prisma.company.create({
    data: {
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
      isSeller,
      isBuyer,
      isShipTo,
      isBrand,
      isCustoms,
      isLogistics,
      isInsurance,
      isAgency,
      repsJson,
      deliveryAddressesJson,
    },
  });

  redirect("/companies");
}

export async function updateCompany(companyId: number, formData: FormData) {
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
  const phone = formData.get("phone") as string;
  
  // Roles
  const isSeller = formData.get("isSeller") === "on";
  const isBuyer = formData.get("isBuyer") === "on";
  const isShipTo = formData.get("isShipTo") === "on";
  const isBrand = formData.get("isBrand") === "on";
  const isCustoms = formData.get("isCustoms") === "on";
  const isLogistics = formData.get("isLogistics") === "on";
  const isInsurance = formData.get("isInsurance") === "on";
  const isAgency = formData.get("isAgency") === "on";

  // Build 10 Representatives array
  const representatives = [];
  for (let i = 1; i <= 10; i++) {
     const repName = (formData.get(`rep${i}_name`) as string)?.toLocaleUpperCase("tr-TR");
     const repNameEn = (formData.get(`rep${i}_nameEn`) as string)?.toUpperCase();
     const repTitle = (formData.get(`rep${i}_title`) as string)?.toLocaleUpperCase("tr-TR");
     const repPhone = formData.get(`rep${i}_phone`) as string;
     const repEmail = formData.get(`rep${i}_email`) as string;
     
     if (repName || repNameEn || repTitle || repPhone || repEmail) {
       representatives.push({
          name: repName || "",
          nameEn: repNameEn || "",
          title: repTitle || "",
          phone: repPhone || "",
          email: repEmail || "",
       });
     }
  }
  const repsJson = JSON.stringify(representatives);
  
  // Delivery Addresses
  const deliveryAddressesJson = (formData.get("deliveryAddressesJson") as string) || "[]";

  const dataPayload = {
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
      isSeller,
      isBuyer,
      isShipTo,
      isBrand,
      isCustoms,
      isLogistics,
      isInsurance,
      isAgency,
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
