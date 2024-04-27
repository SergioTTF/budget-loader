import { Transaction as PluggyTransaction, TransactionType } from 'pluggy-sdk';
import { Transaction as OrganizzeTransaction } from 'organizze-sdk';
import { format } from '../utils';
import { mapCategory, specificMapping } from '../config/category-mapper';
import { Loader } from '../model/loader';
import { Bank } from '../model/bank';

export function mapTransaction(tx: PluggyTransaction, loader: Loader): OrganizzeTransaction {
    let transaction: OrganizzeTransaction;
    transaction = {
        description: mapDescription(tx),
        paid: true,
        amountCents: convertToCents(tx.amount, tx.type),
        accountId: mapAccount(tx.accountId, loader),
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

function convertToCents(amount: number, txType: TransactionType) {
  return txType == "DEBIT" && amount > 0 ?  amount * -100: amount * 100;
}

function mapAccount(accountId: string, loader: Loader): number {
  for (let bank of loader.banks) {
    if (bank.pluggy?.checkingAccountId == accountId ||bank.pluggy?.creditAccountId == accountId) {
      return bank.organizze.accountId;
    }
  }
  return loader.banks.filter((bank) => bank.default)[0].organizze?.accountId;
}

