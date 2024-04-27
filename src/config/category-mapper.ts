import { OrganizzeCategory } from "./categories";
import { Transaction as PluggyTransaction} from 'pluggy-sdk';
import { Transaction as OrganizzeTransaction } from 'organizze-sdk';

function mapCategory(categoryName: string): OrganizzeCategory {
    switch (categoryName) {
      case 'Income':
      case 'Proceeds interests and dividends':
      case 'Fixed income':
      case 'Variable income':
        return OrganizzeCategory.OtherIncome;
      case 'Food and drinks':
        return OrganizzeCategory.Food;
      case 'Food delivery':
        return OrganizzeCategory.Delivery;
      case 'Taxi and ride-hailing':
        return OrganizzeCategory.Uber;
      case 'Parking':
        return OrganizzeCategory.Parking;
      case 'Healthcare':
      case 'Pharmacy':
        return OrganizzeCategory.Health;
      case 'Loans and financing':
        return OrganizzeCategory.Loans;
      case 'Late payment and overdraft costs':
      case 'Interests charged':
      case 'Financing':
      case 'Real estate financing':
      case 'Vehicle financing':
      case 'Student loan':
        return OrganizzeCategory.DebtsAndLoans;
      case 'Investments':
      case 'Automatic investment':
      case 'Mutual funds':
      case 'Margin':
      case 'Proceeds interests and dividends':
      case 'Pension':
        return OrganizzeCategory.Investments;
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
        return OrganizzeCategory.Shopping;
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
        return OrganizzeCategory.SubscriptionsAndServices;
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
        return OrganizzeCategory.Transfers;
      case 'Legal obligations':
      case 'Blocked balances':
      case 'Alimony':
        return OrganizzeCategory.TaxesAndFees;
      case 'Travel':
      case 'Airport and airlines':
      case 'Accomodation':
      case 'Mileage programs':
      case 'Bus tickets':
        return OrganizzeCategory.Travel;
      case 'Donations':
        return OrganizzeCategory.GiftsAndDonations;
      case 'Gambling':
      case 'Lottery':
      case 'Online bet':
        return OrganizzeCategory.LeisureAndHobbies;
      case 'Taxes':
      case 'Income taxes':
      case 'Taxes on investments':
      case 'Tax on financial operations':
        return OrganizzeCategory.TaxesAndFees;
      case 'Bank fees':
      case 'Account fees':
      case 'Wire transfer fees and ATM fees':
      case 'Credit card fees':
        return OrganizzeCategory.TaxesAndFees;
      case 'Housing':
      case 'Rent':
      case 'Utilities':
      case 'Water':
      case 'Electricity':
      case 'Gas':
      case 'Houseware':
      case 'Urban land and building tax':
        return OrganizzeCategory.Home;
      case 'Dentist':
      case 'Optometry':
      case 'Hospital clinics and labs':
        return OrganizzeCategory.Health;
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
        return OrganizzeCategory.Transportation;
      case 'Insurance':
      case 'Life insurance':
      case 'Home insurance':
      case 'Health insurance':
      case 'Vehicle insurance':
        return OrganizzeCategory.Investments;
      case 'Leisure':
        return OrganizzeCategory.LeisureAndHobbies;
      default:
        return OrganizzeCategory.Others;
    }
  }

  function specificMapping(pluggyTx: PluggyTransaction, organizzeTx: OrganizzeTransaction) {
    const { DATING_CPF = ''} = process.env
    const DOCTOR_CPF = process.env.DOCTOR_CPF.split(',');
    if (pluggyTx.paymentData?.receiver?.documentNumber?.value == DATING_CPF) {
      organizzeTx.categoryId = OrganizzeCategory.Dating;
      organizzeTx.description.concat(" - Dating");
    } else if (DOCTOR_CPF.includes(pluggyTx.paymentData?.receiver?.documentNumber?.value)) {
      organizzeTx.categoryId = OrganizzeCategory.Health;
      organizzeTx.description.concat(" - Doctor");
    } else if(pluggyTx.description.toLowerCase().includes("uber")) {
      organizzeTx.categoryId = OrganizzeCategory.Uber;
    } else if(pluggyTx.description.toLowerCase().includes("ifood") || pluggyTx.description.toLowerCase().includes("ifd*")) {
      organizzeTx.categoryId = OrganizzeCategory.Delivery;
    }
  }

  export { mapCategory, specificMapping };