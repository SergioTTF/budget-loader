import { PluggyClient, Transaction, TransactionFilters } from 'pluggy-sdk'
import 'dotenv/config'
import { PluggyConstants } from './constants/pluggy'
import { Client }from "@notionhq/client"
import { format } from './utils'
import { mapTransaction } from './mapper'
import * as util from 'util';
import { testOrganizze } from './organizze'

void (async function(): Promise<void> {
  const { CLIENT_ID = '', CLIENT_SECRET = '', NOTION_DATABASE_ID= '' } = process.env

  const client = new PluggyClient({
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
  })
  const notion = new Client({
    auth: process.env.NOTION_TOKEN,
  })
  let lastTwoWeeksDate = new Date();
  lastTwoWeeksDate.setDate(lastTwoWeeksDate.getDate() - 15);
  const transactionsfilter: TransactionFilters = {
    from:format(lastTwoWeeksDate),
  }
  let nubankCreditTransactions = await client.fetchTransactions(PluggyConstants.Nubank.CREDIT_ACCOUNT_ID, transactionsfilter);
  let nubankTransactions = await client.fetchTransactions(PluggyConstants.Nubank.CHECKING_ACCOUNT_ID, transactionsfilter);
  let interTransactions = await client.fetchTransactions(PluggyConstants.Inter.CHECKING_ACCOUNT_ID, transactionsfilter);
  const transactions:Transaction[] = nubankCreditTransactions.results.concat(nubankTransactions.results).concat(interTransactions.results);
  const databaseItens = await notion.databases.query({database_id:NOTION_DATABASE_ID});
  let count = 0;
  transactions.forEach(tx => {
    if(!databaseItens.results.some(expense  => (expense as any).properties.transactionId.rich_text[0].text.content == tx.id)){
      notion.pages.create(mapTransaction(tx));
      count++;
    }
  })
  console.log(count + " records created");
  await testOrganizze() 
})()
