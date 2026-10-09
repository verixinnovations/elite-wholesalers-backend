// src/utils/zoho-payload-generator.util.ts
import { CreateUserDto, AccountType } from '../../user/dto/create-user.dto';
import { ContactType, CreateContactDto } from './create-zoho-user.dto';

interface customFieldIndicies {
  user_id: number;
  account_type: number;
  abn: number;
  acn: number;
  licence_number: number;
}

export class ZohoPayloadGenerator {
  /**
   * Transforms your local CreateUserDto into Zoho's CreateContactDto
   *
   * @param userDto The incoming user registration payload
   * @param customFieldIndices Map your Zoho Custom Field index numbers here
   */
  static generateContactCreationPayload(
    userDto: CreateUserDto,
    customFieldIndices: customFieldIndicies = {
      user_id: 1,
      account_type: 2,
      abn: 3,
      acn: 4,
      licence_number: 5,
    },
  ): CreateContactDto {
    const payload = new CreateContactDto();

    payload.contact_type = ContactType.CUSTOMER;

    const fullName = `${userDto.firstname} ${userDto.lastname}`.trim();

    payload.contact_name =
      userDto.accountType === AccountType.TRADER && userDto.business_details
        ? userDto.business_details.business_name
        : fullName;

    payload.custom_fields = [
      {
        index: customFieldIndices.user_id,
        label: 'UserId',
        value: userDto.id,
      },
      {
        index: customFieldIndices.account_type,
        label: 'AccountType',
        value: userDto.accountType,
      },
    ];

    if (
      userDto.accountType === AccountType.TRADER &&
      userDto.business_details
    ) {
      payload.company_name = userDto.business_details.business_name;
      payload.website = userDto.business_details.business_website;

      if (userDto.business_details.abn) {
        payload.custom_fields.push({
          index: customFieldIndices.abn,
          label: 'ABN',
          value: userDto.business_details.abn,
        });
      }

      if (userDto.business_details.acn) {
        payload.custom_fields.push({
          index: customFieldIndices.acn,
          label: 'ACN',
          value: userDto.business_details.acn,
        });
      }

      if (userDto.business_details.license_number) {
        payload.custom_fields.push({
          index: customFieldIndices.licence_number,
          label: 'Licence Number',
          value: userDto.business_details.license_number,
        });
      }
    }

    payload.contact_persons = [
      {
        first_name: userDto.firstname,
        last_name: userDto.lastname,
        email: userDto.email,
        phone: userDto.phone_number,
        is_primary_contact: true,
      },
    ];

    if (userDto.location) {
      const zohoAddressObj = {
        address: userDto.location.street,
        city: userDto.location.city,
        state: userDto.location.state,
        zip: userDto.location.zip_code || userDto.location.postal_code,
        country: userDto.location.country,
      } as any;

      payload.billing_address = zohoAddressObj;
      payload.shipping_address = zohoAddressObj;
    }

    return payload;
  }

  /**
   * Generates a payload to update an existing Zoho contact using their contact ID.
   * (Usually shares the same structural properties as the creation payload in Zoho)
   */
  static generateContactUpdatePayload(
    userDto: CreateUserDto,
    customFieldIndices: customFieldIndicies = {
      user_id: 1,
      account_type: 2,
      abn: 3,
      acn: 4,
      licence_number: 5,
    },
  ): CreateContactDto {
    // Reuses the creation pattern since Zoho update bodies typically mirror creation fields
    return this.generateContactCreationPayload(userDto, customFieldIndices);
  }

  /**
   * Generates a payload to update *just* a specific custom field (e.g., account type / role).
   * Useful when sending a partial update payload to Zoho.
   */
  static generateCustomFieldUpdatePayload(
    fieldIndex: number,
    fieldLabel: string,
    value: any,
  ) {
    return {
      custom_fields: [
        {
          index: fieldIndex,
          label: fieldLabel,
          value: value,
        },
      ],
    };
  }
}
