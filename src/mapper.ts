import type { CreatePageParameters } from '@notionhq/client/build/src/api-endpoints'
import { Transaction } from 'pluggy-sdk';
import { format } from './utils';
import { PluggyConstants } from './constants/pluggy';
export function mapTransaction(tx: Transaction): CreatePageParameters {
  let page: CreatePageParameters;
  page = {
    parent: {
      database_id: '18a40c8f-39b4-43fc-a0f4-537762d84363'
    },
    properties: {
      Comment: { rich_text: [{ text: { content: valueOrEmpty(tx.descriptionRaw)} }] },
      Amount: { number: Math.abs(tx.amount) },
      Category: { relation: [{ id: mapCategory(tx.category) }] },
      Type: { select: { name: mapType(tx.type) } },
      Date: { date: { start: format(tx.date) } },
      transactionId: { rich_text: [{ text: { content: tx.id } }] },
      Title: { title: [{ text: { content: mapTitle(tx) } }] },
      Bank: { select: { name: mapBank(tx.accountId) } }
    }

  }
  specificMapping(tx, page);
  return page;
}

function valueOrEmpty(str: string | null) {
  return str ? str : "";
}

function mapTitle(tx: Transaction): string {
  let title = tx.description;
  if (tx.description == "Transferência Pix") {
    if (tx.paymentData?.payer?.name) {
      title += ` - Pagador: ${tx.paymentData?.payer.name}`
    }
    if (tx.merchant?.name) {
      title += ` - Loja: ${tx.merchant?.name}`
    } else if (tx.paymentData?.receiver?.name) {
      title += ` - Recebedor: ${tx.paymentData?.receiver.name}`
    }
  }
  return title;
}

export function mapCategory(txCategory: string): CATEGORY {
  switch (txCategory) {
    case "Income":
    case "Proceeds interests and dividends":
      return CATEGORY.INCOME;
    case "Food and drinks":
      return CATEGORY.FOOD;
    case "Food delivery":
      return CATEGORY.DELIVERY
    case "Taxi and ride-hailing":
      return CATEGORY.UBER;
    case "Parking":
      return CATEGORY.PARKING;
    case "Healthcare":
    case "Pharmacy":
      return CATEGORY.HEALTH;
    default:
      return CATEGORY.OTHER;
  }
}

function mapType(txType): string {
  switch (txType) {
    case "DEBIT":
      return "Expense";
    case "CREDIT":
      return "Income"
    default:
      return "Other";
  }
}

function mapBank(accountId: string): string {
  switch (accountId) {
    case PluggyConstants.Inter.CHECKING_ACCOUNT_ID:
      return "Inter";
    case PluggyConstants.Nubank.CHECKING_ACCOUNT_ID:
    case PluggyConstants.Nubank.CREDIT_ACCOUNT_ID:
      return "Nubank"
    default:
      return "Other";
  }
}

enum CATEGORY {
  TAXES = "6b856ced-2ff0-44cc-9f2d-adddf6b5cab6",
  UTILITIES = "4af56613-3583-478c-b955-5c34cc8ed50d",
  EDUCATION = "f005e0c5-6988-4ad8-89f2-f72309d5bee5",
  RELATIONSHIPS = "9fbf2595-1637-4ffd-8ed5-dc799a3f27e3",
  TRAVEL = "fc21ec02-4015-435b-aafc-a803976fa02c",
  TRANSPORT = "e81b7d2e-eac7-493f-af1b-92476e06e65c",
  HEALTH = "db2d588d-ce46-4edc-b9f8-4a85c6b97d24",
  HOME = "d6510ca8-21d9-4d11-b0a7-059f9024e497",
  FOOD = "d13f877d-3ef8-4a20-969f-75c07e86d5bb",
  ENTERTAINMENT = "a571d9fb-7ec8-42f5-9530-92a8a516b0a1",
  OTHER = "857d03dd-3341-419e-84dc-673888900335",
  INCOME = "31fea063-4f40-4179-b4e2-06886a2c9b36",
  SUBSCRIPTIONS = "8af4ec80-5891-46fe-9e52-ed7979b6d972",
  INTERNET_PHONE = "0fddc538-c37c-4d9e-b7b0-776e552a270b",
  ELETRICITY_WATER_GAS = "9566c9ca-5bec-42be-bf83-dc6ef53e8a86",
  RENT = "a4b00b60-ce42-4cd0-8c89-fb0bac995fa4",
  BOOKS = "6a6a54e7-7f4c-44a7-916b-b35ada449d7e",
  FAMILY = "a5b39a69-4266-47b9-9aef-a7c5bb19105f",
  PETS = "d7cd0b39-31fc-43d5-93aa-ec47be2d6679",
  GIFTS = "9a65a0a3-3897-409f-8657-08b4404cb977",
  DELIVERY = "c20e57ea-b832-4b65-95f4-1dfa8c76ce54",
  RESTAURANT = "ea03a7a9-7650-47f2-8fe7-3c4a933def26",
  GYM = "2dbb35d8-7a11-4515-b7da-54f1e01460cc",
  SUPPLEMENTS = "756235d7-76a0-48c4-9190-57e80b69533b",
  CLOTHING = "81dd74ae-941c-41d1-991c-78103ef4d176",
  SUPERMARKET = "4e1a9b89-abf9-4ec6-9762-68de91310d22",
  UBER = "71383245-0569-40c2-a3b1-af92a68165bd",
  PERSONAL_CARE = "76032388-694e-4760-9173-4fdde16210df",
  PARKING = "90048bc8-b173-47a8-8916-29f1a4d86106",
  CAR = "78f9049b-37d5-499c-890a-aaeb01ff114a",
  NAMORO = "0c2077c8-9234-4939-9384-6103833fb9f2",
}

function specificMapping(tx: Transaction, page: CreatePageParameters): void {
  const { DATING_CPF = '', DOCTOR_CPF = '' } = process.env
  if (tx.paymentData?.receiver?.documentNumber?.value == DATING_CPF) {
    page.properties.Category = { relation: [{ id: CATEGORY.NAMORO }] };
    appendTextToTitle(page, " - Namoro");
  } else if (tx.paymentData?.receiver?.documentNumber?.value == DOCTOR_CPF) {
    page.properties.Category = { relation: [{ id: CATEGORY.HEALTH }] };
    appendTextToTitle(page, " - Psicóloga");
  }
}

function appendTextToTitle(page: CreatePageParameters, text: string): void {
  (page.properties.Title as any).title[0].text.content += text;
}