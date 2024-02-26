import { Transaction as PluggyTransaction } from 'pluggy-sdk';
import { OrganizzeCategory as Category } from '../enum/categories'
import { Transaction as OrganizzeTransaction } from 'organizze-sdk';
import { PluggyConstants } from '../constants/pluggy';
import { OraganizzeConstants } from '../constants/oraganizze';
import { format } from '../utils';

export function mapTransaction(tx: PluggyTransaction): OrganizzeTransaction {
    let transaction: OrganizzeTransaction;
    transaction = {
        description: mapDescription(tx),
        paid: true,
        amountCents: convertToCents(tx.amount),
        accountId: mapAccount(tx.accountId),
        categoryId: mapCategory(tx.category),
        notes: tx.id,
        date:format(tx.date)
    }
    specificMapping(tx, transaction);
    return transaction;
  }
export function mapDescription(tx: PluggyTransaction): string {
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

function convertToCents(amount: number) {
  return amount * 100;
}

function mapAccount(accountId: string): number {
  switch (accountId) {
    case PluggyConstants.Inter.CHECKING_ACCOUNT_ID:
      return OraganizzeConstants.Inter.ACCOUNT_ID;
    case PluggyConstants.Nubank.CHECKING_ACCOUNT_ID:
    case PluggyConstants.Nubank.CREDIT_ACCOUNT_ID:
      return OraganizzeConstants.Nubank.ACCOUNT_ID;
    default:
      return OraganizzeConstants.Default.ACCOUNT_ID;
  }
}

function specificMapping(pluggyTx: PluggyTransaction, organizzeTx: OrganizzeTransaction) {
  const { DATING_CPF = '', DOCTOR_CPF = ''} = process.env
  if (pluggyTx.paymentData?.receiver?.documentNumber?.value == DATING_CPF) {
    organizzeTx.categoryId = Category.Dating;
    organizzeTx.description.concat(" - Namoro");
  } else if (pluggyTx.paymentData?.receiver?.documentNumber?.value == DOCTOR_CPF) {
    organizzeTx.categoryId = Category.Health;
    organizzeTx.description.concat(" - Psicóloga");
  }
}


export function mapCategory(categoryName: string): Category {
    switch (categoryName) {
      case 'Income':
      case 'Proceeds interests and dividends':
      case 'Fixed income':
      case 'Variable income':
        return Category.OtherIncome;
      case 'Food and drinks':
        return Category.Food;
      case 'Food delivery':
        return Category.Delivery;
      case 'Taxi and ride-hailing':
        return Category.Uber;
      case 'Parking':
        return Category.Parking;
      case 'Healthcare':
      case 'Pharmacy':
        return Category.Health;
      case 'Loans and financing':
        return Category.Loans;
      case 'Late payment and overdraft costs':
      case 'Interests charged':
      case 'Financing':
      case 'Real estate financing':
      case 'Vehicle financing':
      case 'Student loan':
        return Category.DebtsAndLoans;
      case 'Investments':
      case 'Automatic investment':
      case 'Mutual funds':
      case 'Margin':
      case 'Proceeds interests and dividends':
      case 'Pension':
        return Category.Investments;
      case 'Shopping':
      case 'Online shopping':
      case 'Electronics':
      case 'Pet supplies and vet':
      case 'Clothing':
      case 'Kids and toys':
      case 'Bookstore':
      case 'Sports goods':
      case 'Office supplies':
      case 'Cashback':
        return Category.Shopping;
      case 'Services':
      case 'Telecommunications':
      case 'Internet':
      case 'Mobile':
      case 'TV':
      case 'Education':
      case 'Online Courses':
      case 'University':
      case 'School':
      case 'Kindergarten':
      case 'Wellness and fitness':
      case 'Gyms and fitness centers':
      case 'Sports practice':
      case 'Wellness':
      case 'Tickets':
      case 'Stadiums and arenas':
      case 'Landmarks and museums':
      case 'Cinema, theater and concerts':
        return Category.SubscriptionsAndServices;
      case 'Transfers':
      case 'Transfer - Bank Slip':
      case 'Transfer - Cash':
      case 'Transfer - Check':
      case 'Transfer - DOC':
      case 'Transfer - Foreign Exchange':
      case 'Transfer - Internal':
      case 'Transfer - PIX':
      case 'Transfer - TED':
      case 'Third party transfers':
      case 'Third party transfer - Bank Slip':
      case 'Third party transfer - Debit Card':
      case 'Third party transfer - DOC':
      case 'Third party transfer - PIX':
      case 'Third party transfer - TED':
      case 'Credit card payment':
        return Category.Transfers;
      case 'Legal obligations':
      case 'Blocked balances':
      case 'Alimony':
        return Category.TaxesAndFees;
      case 'Travel':
      case 'Airport and airlines':
      case 'Accomodation':
      case 'Mileage programs':
      case 'Bus tickets':
        return Category.Travel;
      case 'Donations':
        return Category.GiftsAndDonations;
      case 'Gambling':
      case 'Lottery':
      case 'Online bet':
        return Category.LeisureAndHobbies;
      case 'Taxes':
      case 'Income taxes':
      case 'Taxes on investments':
      case 'Tax on financial operations':
        return Category.TaxesAndFees;
      case 'Bank fees':
      case 'Account fees':
      case 'Wire transfer fees and ATM fees':
      case 'Credit card fees':
        return Category.TaxesAndFees;
      case 'Housing':
      case 'Rent':
      case 'Utilities':
      case 'Water':
      case 'Electricity':
      case 'Gas':
      case 'Houseware':
      case 'Urban land and building tax':
        return Category.Home;
      case 'Dentist':
      case 'Optometry':
      case 'Hospital clinics and labs':
        return Category.Health;
      case 'Transportation':
      case 'Taxi and ride-hailing':
      case 'Public transportation':
      case 'Car rental':
      case 'Bicycle':
      case 'Automotive':
      case 'Gas stations':
      case 'Parking':
      case 'Tolls and in vehicle payment':
      case 'Vehicle ownership taxes and fees':
      case 'Vehicle maintenance':
      case 'Traffic tickets':
        return Category.Transportation;
      case 'Insurance':
      case 'Life insurance':
      case 'Home insurance':
      case 'Health insurance':
      case 'Vehicle insurance':
        return Category.Investments;
      case 'Leisure':
        return Category.LeisureAndHobbies;
      default:
        return Category.Others;
    }
  }