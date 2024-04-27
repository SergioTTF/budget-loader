# budget-loader
The `budget-loader` project is a Node.js application that retrieves transaction data from the [Pluggy API](https://www.organizze.com.br/) and inserts it into a budget using the [Organizze API](https://www.organizze.com.br/). It allows users to customize the mapping of transaction data to categories and provides a flexible way to categorize transactions based on specific data attributes.

> :warning:  **Disclaimer**: This project has no association with Pluggy or Organizze! It's an unofficial app created to help developers with their finances.

## Environment variables

To run this application, you need to set the following environment variables:

- `CLIENT_ID`: Pluggy client id.
- `CLIENT_SECRET`: Pluggy client secret.
- `ORGANIZZE_USERNAME`: Organizze username.
- `ORGANIZZE_PASSWORD`: Organizze password.
- `ORGANIZZE_USER_AGENT`: Organizze user agent, typically the name of your application or your email.

You can set these variables in your shell or in a `.env` file.

## Loader Configuration

The `loader.yaml` file is used to configure the banks and categories that should be loaded by the budget-loader application. It has the following structure:

### Banks

The `banks` section contains a list of banks that you want to load transactions from. Each bank has the following properties:

- `name`: The name of the bank.
- `organizze`: The Organizze account configuration for the bank.
  - `accountId`: The Organizze account ID for the bank.
- `pluggy`: The Pluggy account configuration for the bank.
  - `itemId`: The Pluggy item ID for the bank.
  - `checkingAccountId`: The Pluggy checking account ID for the bank.
  - `creditAccountId` (optional): The Pluggy credit account ID for the bank (if applicable).
- `default` (optional): A boolean indicating whether this is the default bank. If true, transactions without a matching bank name will be attributed to this bank.

## Customizing Category Mapping

In the budget-loader application, you have the flexibility to customize how transactions are categorized by modifying the `mapCategory` function and utilizing the `specificMapping` function.

### OrganizzeCategory Enum

The `OrganizzeCategory` Enum is an enumeration that represents the categories of your Organizze account. Each category has its corresponding Id, in order to get this information you should retrive your categories from your Organizze API and fill all the category data:

```ts
enum OrganizzeCategory {
  Clothes = 125082753,
  DebtsAndLoans = 125082754,
  InvestmentsReturns = 125082755,
  Education = 125082756,
  LeisureAndHobbies = 125082757,
}
```

File containing this enum: `src/config/categories.ts`


### Customizing `mapCategory` Function
The `mapCategory` function is responsible for mapping the transaction category string received by the Pluggy API to predefined categories declared in the OrganizzeCategory enum. You can customize the category that will be mapped to your categories by modifying the switch statement:

```ts
function mapCategory(categoryName: string): OrganizzeCategory {
    switch (categoryName) {
      case 'Fixed income':
      case 'Variable income':
        return OrganizzeCategory.OtherIncome;
      case 'Food delivery':
        return OrganizzeCategory.Delivery;
      case 'Taxi and ride-hailing':
        return OrganizzeCategory.Uber;
      default:
        return OrganizzeCategory.Others
}
```

### Customizing `specificMapping` Function
The `specificMapping` function allows you to make specific alterations to the mapped object based on the original transaction data received from the Pluggy API. You can set a category based on the receiver's name or append some text to the title of your transaction:

```ts
function specificMapping(pluggyTx: PluggyTransaction, organizzeTx: OrganizzeTransaction) {
    const DOCTOR_CPF = process.env.DOCTOR_CPF.split(',');
    if (DOCTOR_CPF.includes(pluggyTx.paymentData?.receiver?.documentNumber?.value)) {
      organizzeTx.categoryId = OrganizzeCategory.Health;
      organizzeTx.description.concat(" - Doctor");
    } else if(pluggyTx.description.toLowerCase().includes("uber")) {
      organizzeTx.categoryId = OrganizzeCategory.Uber;
    } else if(pluggyTx.description.toLowerCase().includes("ifood") || pluggyTx.description.toLowerCase().includes("ifd*")) {
      organizzeTx.categoryId = OrganizzeCategory.Delivery;
    }
  }
```
File containing these functions: `src/config/category-mapper.ts`

## Contributing

Feel free to suggest improvements or submit Pull Requests to collaborate with the project!