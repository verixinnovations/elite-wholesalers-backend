import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, IsEnum, Matches } from 'class-validator';
export enum AustralianState {
  NSW = 'nsw',
  QLD = 'qld',
  VIC = 'vic',
  WA = 'wa',
  SA = 'sa',
  TAS = 'tas',
  ACT = 'act',
  NT = 'nt',
}

export class VerifyAbnDto {
  @IsString()
  @IsNotEmpty({ message: 'ABN is required' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.replace(/\s+/g, '') : value,
  )
  @Matches(/^\d{11}$/, {
    message: 'ABN must contain exactly 11 digits',
  })
  abn: string;
}

export class VerifyLicenseDto {
  @IsString()
  @IsNotEmpty({ message: 'License number is required' })
  licenceNumber: string;

  @IsEnum(AustralianState, {
    message:
      'stateIssued must be a valid Australian state (e.g., nsw, qld, vic)',
  })
  @IsNotEmpty({ message: 'Issuing state is required' })
  stateIssued: AustralianState;
}
