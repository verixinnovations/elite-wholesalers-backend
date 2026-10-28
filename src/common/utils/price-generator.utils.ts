import { AccountType } from '../../modules/user/dto/create-user.dto';
import { ProductEntity } from '../../modules/zoho/zoho-interface';
import { Currency } from './numbers.utils';

const generatePriceByAccountType =
  (accountType: AccountType = AccountType.INDIVIDUAL, rate_field = 'rate') =>
  (item: ProductEntity) => ({
    ...item,
    price: {
      amount:
        accountType === AccountType.INDIVIDUAL
          ? item[rate_field] * 1.2
          : item.rate,
      currency: Currency.AUD,
    },
  });

export { generatePriceByAccountType };
