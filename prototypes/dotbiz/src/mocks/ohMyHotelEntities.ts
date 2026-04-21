/* OhMyHotel Legal Entities
 *
 * Each entity is a separate legal subject with its own:
 *  - tax registration + e-invoice system
 *  - bank account
 *  - default currency
 *  - corporate address
 *
 * Currently only SG and VN issue customer contracts. KR/JP/HK entities
 * exist corporately but route their hotel bookings through SG contracts
 * (KR/JP/HK hotels settle via OhMyHotel Singapore to the customer).
 *
 * VN is the only "local" exception because Vietnam VAT law requires
 * domestic supplier↔buyer for VN hotel bookings → VN legal entity
 * invoices the customer (who must also have a VN contract).
 */

export type EntityId = "omh-sg" | "omh-vn" | "omh-kr" | "omh-jp" | "omh-hk";

export interface BankInfo {
  bankName: string;
  swift: string;
  accountHolder: string;
  accountNumber: string;
  bankAddress: string;
}

export interface OhMyHotelEntity {
  id: EntityId;
  legalName: string;
  shortName: string;        /* e.g. "OhMyHotel SG" */
  country: string;          /* ISO code */
  countryFlag: string;      /* emoji */
  taxId: string;            /* local business-registration / tax ID */
  taxIdLabel: string;       /* "UEN" / "Mã số thuế" / "사업자등록번호" etc. */
  address: string;
  phone: string;
  currency: string;
  bankInfo: BankInfo;
  eInvoiceSystem: "IRAS" | "VN-eHoaDon" | "NTS" | "JP-Invoice" | "None";
  isHQ: boolean;
  /* Whether this entity ISSUES CONTRACTS to external customers.
   * If false, the entity exists corporately but hotel bookings in its
   * country are handled through SG contracts (international B2B export). */
  isContractIssuer: boolean;
  refCodePrefix: string;    /* Used in Top-Up ref codes: TUP-{prefix}-… */
}

export const ohMyHotelEntities: OhMyHotelEntity[] = [
  {
    id: "omh-sg",
    legalName: "OHMYHOTEL GLOBAL PTE. LTD.",
    shortName: "OhMyHotel SG",
    country: "SG", countryFlag: "🇸🇬",
    taxId: "202543984E", taxIdLabel: "UEN",
    address: "111 Somerset Road, #06-01H, Singapore 238164",
    phone: "+65 6123-4567",
    currency: "USD",
    bankInfo: {
      bankName: "Citibank Singapore",
      swift: "CITISGSGXXX",
      accountHolder: "OHMYHOTEL GLOBAL PTE. LTD.",
      accountNumber: "143746003",
      bankAddress: "8 Marina View, #21-00 Asia Square Tower 1, Singapore 018960",
    },
    eInvoiceSystem: "IRAS",
    isHQ: true,
    isContractIssuer: true,
    refCodePrefix: "SG",
  },
  {
    id: "omh-vn",
    legalName: "OHMYHOTEL VIETNAM CO., LTD.",
    shortName: "OhMyHotel VN",
    country: "VN", countryFlag: "🇻🇳",
    taxId: "0312985640", taxIdLabel: "Mã số thuế",
    address: "Bitexco Financial Tower, 2 Hai Trieu, District 1, HCMC, Vietnam",
    phone: "+84 28 3821-4567",
    currency: "VND",
    bankInfo: {
      bankName: "Vietcombank (HCMC)",
      swift: "BFTVVNVX007",
      accountHolder: "CONG TY TNHH OHMYHOTEL VIETNAM",
      accountNumber: "0071002385471",
      bankAddress: "29 Ben Chuong Duong, District 1, HCMC, Vietnam",
    },
    eInvoiceSystem: "VN-eHoaDon",
    isHQ: false,
    isContractIssuer: true,
    refCodePrefix: "VN",
  },
  {
    id: "omh-kr",
    legalName: "오마이호텔앤컴퍼니 주식회사 (OHMYHOTEL & CO., LTD.)",
    shortName: "OhMyHotel KR",
    country: "KR", countryFlag: "🇰🇷",
    taxId: "105-87-71311", taxIdLabel: "사업자등록번호",
    address: "6F GT Dongdaemun Building, 328 Jong-ro, Jongno-gu, Seoul",
    phone: "+82 2-762-0552",
    currency: "KRW",
    bankInfo: {
      bankName: "Shinhan Bank",
      swift: "SHBKKRSE",
      accountHolder: "오마이호텔앤컴퍼니(주)",
      accountNumber: "100-037-891234",
      bankAddress: "120 Taepyeong-ro 2-ga, Jung-gu, Seoul",
    },
    eInvoiceSystem: "NTS",
    isHQ: false,
    isContractIssuer: false,
    refCodePrefix: "KR",
  },
  {
    id: "omh-jp",
    legalName: "株式会社オーマイホテルジャパン",
    shortName: "OhMyHotel JP",
    country: "JP", countryFlag: "🇯🇵",
    taxId: "T2011001123456", taxIdLabel: "Invoice Registration No",
    address: "3-2-5 Kasumigaseki, Chiyoda-ku, Tokyo 100-0013",
    phone: "+81 3-5512-3400",
    currency: "JPY",
    bankInfo: {
      bankName: "MUFG Bank (Tokyo)",
      swift: "BOTKJPJT",
      accountHolder: "株式会社オーマイホテルジャパン",
      accountNumber: "0012345-678",
      bankAddress: "2-7-1 Marunouchi, Chiyoda-ku, Tokyo",
    },
    eInvoiceSystem: "JP-Invoice",
    isHQ: false,
    isContractIssuer: false,
    refCodePrefix: "JP",
  },
  {
    id: "omh-hk",
    legalName: "OHMYHOTEL (HK) LIMITED",
    shortName: "OhMyHotel HK",
    country: "HK", countryFlag: "🇭🇰",
    taxId: "76543210", taxIdLabel: "BR Number",
    address: "Room 2801, 28/F Tower 1, Enterprise Square, 9 Sheung Yuet Road, Kowloon Bay, Hong Kong",
    phone: "+852 3711-2345",
    currency: "HKD",
    bankInfo: {
      bankName: "HSBC (Hong Kong)",
      swift: "HSBCHKHHHKH",
      accountHolder: "OHMYHOTEL (HK) LIMITED",
      accountNumber: "004-567-890123",
      bankAddress: "1 Queen's Road Central, Hong Kong",
    },
    eInvoiceSystem: "None",
    isHQ: false,
    isContractIssuer: false,
    refCodePrefix: "HK",
  },
];

export function getEntity(id: EntityId): OhMyHotelEntity {
  const e = ohMyHotelEntities.find(x => x.id === id);
  if (!e) throw new Error(`Unknown OhMyHotel entity: ${id}`);
  return e;
}
