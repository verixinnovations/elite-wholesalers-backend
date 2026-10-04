import { AccountType } from '../../modules/user/dto/create-user.dto';
import { ProductEntity } from '../../modules/zoho/zoho-interface';
import { Currency } from './numbers.utils';

const generatePriceByAccountType =
  (accountType: AccountType = AccountType.INDIVIDUAL) =>
  (item: ProductEntity) => ({
    ...item,
    price: {
      amount:
        accountType === AccountType.INDIVIDUAL ? item.rate * 1.2 : item.rate,
      currency: Currency.AUD,
    },
  });

export { generatePriceByAccountType };
