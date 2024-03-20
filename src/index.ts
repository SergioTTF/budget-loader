import { PluggyClient, Transaction, TransactionFilters } from 'pluggy-sdk'
import 'dotenv/config'
import { PluggyConstants } from './constants/pluggy'
import { format } from './utils'
import * as util from 'util';
import { AuthMethodsConfiguration, Configuration, DefaultApi, createConfiguration } from 'organizze-sdk'
import { mapTransaction } from './mapper/mapper';


export const handler = async (event): Promise<any> => {
  const { CLIENT_ID = '', CLIENT_SECRET = ''} = process.env

  const pluggy = new PluggyClient({
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
  })

  let lastTwoWeeksDate = new Date();
  lastTwoWeeksDate.setDate(lastTwoWeeksDate.getDate() - 15);
  const transactionsfilter: TransactionFilters = {
    from:format(lastTwoWeeksDate),
  }
  let transactions: Transaction[] = [];
  const accountIds: string[] = [PluggyConstants.Nubank.CREDIT_ACCOUNT_ID, PluggyConstants.Nubank.CHECKING_ACCOUNT_ID, PluggyConstants.Inter.CHECKING_ACCOUNT_ID];

  for(let accountId of accountIds) {
    let newTransactions = await pluggy.fetchTransactions(accountId, transactionsfilter);
    transactions = transactions.concat(newTransactions.results);
  }

  
  
  const organizze = new DefaultApi(getOrganizzeConfig());
  const organizzeTransactions = await organizze.getTransactions(undefined,  format(lastTwoWeeksDate), format(new Date()));
  
  let count = 0;
  transactions.forEach(tx => {
    if(!organizzeTransactions.some(transaction  => transaction.notes == tx.id)){
      organizze.createTransaction(mapTransaction(tx));
      count++;
    }
  })
  console.log(count + " records created");
  return count + " records created";
}

function getOrganizzeConfig(): Configuration {
  const { ORGANIZZE_USERNAME = '', ORGANIZZE_PASSWORD = '', ORGANIZZE_USER_AGENT = '' } = process.env

  const authConfig: AuthMethodsConfiguration = {
    "basicAuth": {
        "username": ORGANIZZE_USERNAME,
        "password": ORGANIZZE_PASSWORD
    },
    "userAgent": ORGANIZZE_USER_AGENT
  }

  return createConfiguration({authMethods: authConfig});
}
