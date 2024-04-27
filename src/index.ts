import { PluggyClient, Transaction, TransactionFilters } from 'pluggy-sdk'
import 'dotenv/config'
import { format } from './utils'
import * as util from 'util';
import { AuthMethodsConfiguration, Configuration, DefaultApi, createConfiguration } from 'organizze-sdk'
import { mapTransaction } from './mapper/mapper';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as path from 'path';
import { Loader } from './model/loader';


export const handler = async (event): Promise<any> => {
  const { CLIENT_ID = '', CLIENT_SECRET = '' } = process.env

  const pluggy = new PluggyClient({
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
  })
  
  
  const filePath = path.join(__dirname, 'config/loader.yaml');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const loaderConfig: Loader = yaml.load(fileContents);

  let lastTwoWeeksDate = new Date();
  lastTwoWeeksDate.setDate(lastTwoWeeksDate.getDate() - 15);
  const transactionsfilter: TransactionFilters = {
    from: format(lastTwoWeeksDate),
  }
  let transactions: Transaction[] = [];
  let accountIds: string[] = [];

  for (let bank of loaderConfig.banks) {
    if (bank?.pluggy?.checkingAccountId) {
      accountIds.push(bank.pluggy.checkingAccountId);
    }
    if (bank?.pluggy?.creditAccountId) {
      accountIds.push(bank.pluggy.creditAccountId);
    }
  }

  for (let accountId of accountIds) {
    let newTransactions = await pluggy.fetchTransactions(accountId, transactionsfilter);
    transactions = transactions.concat(newTransactions.results);
  }

  const organizze = new DefaultApi(getOrganizzeConfig());
  const organizzeTransactions = await organizze.getTransactions(undefined, format(lastTwoWeeksDate), format(new Date()));

  let count = 0;
  for (let tx of transactions) {
    if (!organizzeTransactions.some(transaction => transaction.notes == tx.id)) {
      await organizze.createTransaction(mapTransaction(tx, loaderConfig));
      count++;
    }
  }
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

  return createConfiguration({ authMethods: authConfig });
}
