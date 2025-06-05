import { Injectable, NotFoundException } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from 'src/prisma/prisma.service';
export interface Country {
    isoName: string,
    name: string,
    continent: string,
    currencyCode: string,
    currencyName: string,
    currencySymbol: string,
    flag: string,
    callingCodes: Array<string>
}
export interface Operator {
    id: number;
    operatorId: number;
    name: string;
    bundle: boolean;
    data: boolean;
    pin: boolean;
    comboProduct: boolean;
    supportsLocalAmounts: boolean;
    supportsGeographicalRechargePlans: boolean;
    denominationType: 'FIXED' | 'RANGE';
    senderCurrencyCode: string;
    senderCurrencySymbol: string;
    destinationCurrencyCode: string;
    destinationCurrencySymbol: string;
    commission: number;
    internationalDiscount: number;
    localDiscount: number;
    mostPopularAmount: number;
    mostPopularLocalAmount: number;
    minAmount: number | null;
    maxAmount: number | null;
    localMinAmount: number | null;
    localMaxAmount: number | null;
    country: {
        isoName: string;
        name: string;
    };
    fx: {
        rate: number;
        currencyCode: string;
    };
    logoUrls: string[];
    fixedAmounts: number[];
    fixedAmountsDescriptions: Record<string, string>;
    localFixedAmounts: number[];
    localFixedAmountsDescriptions: Record<string, string>;
    suggestedAmounts: number[];
    suggestedAmountsMap: Record<string, string>;
    fees: {
        international: number;
        local: number;
        localPercentage: number;
        internationalPercentage: number;
    };
    geographicalRechargePlans: any[]; // hoặc khai báo interface nếu biết rõ cấu trúc
    promotions: any[];
    status: 'ACTIVE' | 'INACTIVE' | string;
}
@Injectable()
export class InitDataReloadlyService {
    constructor(private prisma: PrismaService) { }
    // async getToken() {
    //     const credential: any = await this.prisma.apiCredential.findFirst({
    //         where: {
    //             type: 'TOPUP'
    //         }
    //     })
    //     if (!credential) {
    //         throw new NotFoundException('No credential found ')
    //     }
    //     const mode = credential?.metadata?.mode
    //     const operatorUrl = mode === 'sandbox' ? 'https://topups-sandbox.reloadly.com/operators' : 'https://topups.reloadly.com/operators'
    //     const countriesUrl = mode === 'sandbox' ? 'https://topups-sandbox.reloadly.com/countries' : 'https://topups.reloadly.com/countries'
    //     const audience = mode === 'sandbox' ? 'https://topups-sandbox.reloadly.com' : 'https://topups.reloadly.com'
    //     const response = await axios.post('https://auth.reloadly.com/oauth/token', {
    //         client_id: credential.apiKey,
    //         client_secret: credential.apiSecret,
    //         grant_type: 'client_credentials',
    //         audience: audience
    //     })
    //     if (response.data) {
    //         const access_token = response.data.access_token
    //         const countries: Array<Country> = await this.getCountries(access_token, countriesUrl)
    //         const operators: Array<Operator> = await this.getOperators(access_token, operatorUrl) 
    //         // Process countries
    //         for (const country of countries) {
    //             await this.prisma.country.upsert({
    //                 where: { code: country.isoName },
    //                 update: {
    //                     name: country.name,
    //                     currencyCode: country.currencyCode,
    //                     currencyName: country.currencyName,
    //                     currencySymbol: country.currencySymbol,
    //                     flag: country.flag,
    //                     continent: country.continent || '',
    //                     callingCodes: country.callingCodes || [],
    //                 },
    //                 create: {
    //                     code: country.isoName,
    //                     name: country.name,
    //                     currencyCode: country.currencyCode,
    //                     currencyName: country.currencyName,
    //                     currencySymbol: country.currencySymbol,
    //                     flag: country.flag,
    //                     continent: country.continent || '',
    //                     callingCodes: country.callingCodes || [],
    //                 },
    //             });
    //         }
    //         // Process operators
    //         for (const operator of operators) {
    //             await this.prisma.operator.upsert({
    //                 where: { operatorId: operator.operatorId },
    //                 update: {
    //                     name: operator.name,
    //                     bundle: operator.bundle,
    //                     data: operator.data,
    //                     pin: operator.pin,
    //                     comboProduct: operator.comboProduct,
    //                     supportsLocalAmounts: operator.supportsLocalAmounts,
    //                     supportsGeographicalRechargePlans: operator.supportsGeographicalRechargePlans,
    //                     denominationType: operator.denominationType,
    //                     senderCurrencyCode: operator.senderCurrencyCode,
    //                     senderCurrencySymbol: operator.senderCurrencySymbol,
    //                     destinationCurrencyCode: operator.destinationCurrencyCode,
    //                     destinationCurrencySymbol: operator.destinationCurrencySymbol,
    //                     commission: operator.commission,
    //                     internationalDiscount: operator.internationalDiscount,
    //                     localDiscount: operator.localDiscount,
    //                     mostPopularAmount: operator.mostPopularAmount,
    //                     mostPopularLocalAmount: operator.mostPopularLocalAmount,
    //                     minAmount: operator.minAmount,
    //                     maxAmount: operator.maxAmount,
    //                     localMinAmount: operator.localMinAmount,
    //                     localMaxAmount: operator.localMaxAmount,
    //                     countryCode: operator.country?.isoName || '',
    //                     fxRate: operator.fx?.rate || 0,
    //                     fxCurrencyCode: operator.fx?.currencyCode || '',
    //                     logoUrls: operator.logoUrls || [],
    //                     fixedAmounts: operator.fixedAmounts || [],
    //                     fixedAmountsDescriptions: operator.fixedAmountsDescriptions || {},
    //                     localFixedAmounts: operator.localFixedAmounts || [],
    //                     localFixedAmountsDescriptions: operator.localFixedAmountsDescriptions || {},
    //                     suggestedAmounts: operator.suggestedAmounts || [],
    //                     suggestedAmountsMap: operator.suggestedAmountsMap || {},
    //                     internationalFee: operator.fees?.international || 0,
    //                     localFee: operator.fees?.local || 0,
    //                     localPercentageFee: operator.fees?.localPercentage || 0,
    //                     internationalPercentageFee: operator.fees?.internationalPercentage || 0,
    //                     geographicalRechargePlans: operator.geographicalRechargePlans || [],
    //                     promotions: operator.promotions || [],
    //                     status: operator.status,
    //                 },
    //                 create: {
    //                     operatorId: operator.operatorId,
    //                     name: operator.name,
    //                     bundle: operator.bundle,
    //                     data: operator.data,
    //                     pin: operator.pin,
    //                     comboProduct: operator.comboProduct,
    //                     supportsLocalAmounts: operator.supportsLocalAmounts,
    //                     supportsGeographicalRechargePlans: operator.supportsGeographicalRechargePlans,
    //                     denominationType: operator.denominationType,
    //                     senderCurrencyCode: operator.senderCurrencyCode,
    //                     senderCurrencySymbol: operator.senderCurrencySymbol,
    //                     destinationCurrencyCode: operator.destinationCurrencyCode,
    //                     destinationCurrencySymbol: operator.destinationCurrencySymbol,
    //                     commission: operator.commission,
    //                     internationalDiscount: operator.internationalDiscount,
    //                     localDiscount: operator.localDiscount,
    //                     mostPopularAmount: operator.mostPopularAmount,
    //                     mostPopularLocalAmount: operator.mostPopularLocalAmount,
    //                     minAmount: operator.minAmount,
    //                     maxAmount: operator.maxAmount,
    //                     localMinAmount: operator.localMinAmount,
    //                     localMaxAmount: operator.localMaxAmount,
    //                     countryCode: operator.country?.isoName || '',
    //                     fxRate: operator.fx?.rate || 0,
    //                     fxCurrencyCode: operator.fx?.currencyCode || '',
    //                     logoUrls: operator.logoUrls || [],
    //                     fixedAmounts: operator.fixedAmounts || [],
    //                     fixedAmountsDescriptions: operator.fixedAmountsDescriptions || {},
    //                     localFixedAmounts: operator.localFixedAmounts || [],
    //                     localFixedAmountsDescriptions: operator.localFixedAmountsDescriptions || {},
    //                     suggestedAmounts: operator.suggestedAmounts || [],
    //                     suggestedAmountsMap: operator.suggestedAmountsMap || {},
    //                     internationalFee: operator.fees?.international || 0,
    //                     localFee: operator.fees?.local || 0,
    //                     localPercentageFee: operator.fees?.localPercentage || 0,
    //                     internationalPercentageFee: operator.fees?.internationalPercentage || 0,
    //                     geographicalRechargePlans: operator.geographicalRechargePlans || [],
    //                     promotions: operator.promotions || [],
    //                     status: operator.status,
    //                 },
    //             });
    //         }
    //         return{
    //             success: true,
    //             message: 'Data updated successfully'
    //         }
    //     }
    // }
    // async getCountries(access_token: string, countriesUrl: string) {
    //     const response = await axios.get(countriesUrl, {
    //         headers: {
    //             Authorization: `Bearer ${access_token}`
    //         }
    //     })
    //     return response.data
    // }
    // async getOperators(access_token: string, operatorUrl: string) {
    //     const response = await axios.get(operatorUrl, {
    //         headers: {
    //             Authorization: `Bearer ${access_token}`
    //         }
    //     })
    //     return response.data.content
    // }
    async getToken() {
        const credential: any = await this.prisma.apiCredential.findFirst({
            where: { type: 'TOPUP' }
        });
        if (!credential) throw new NotFoundException('No credential found');

        const mode = credential?.metadata?.mode;
        const operatorUrl = mode === 'sandbox'
            ? 'https://topups-sandbox.reloadly.com/operators'
            : 'https://topups.reloadly.com/operators';
        const countriesUrl = mode === 'sandbox'
            ? 'https://topups-sandbox.reloadly.com/countries'
            : 'https://topups.reloadly.com/countries';
        const audience = mode === 'sandbox'
            ? 'https://topups-sandbox.reloadly.com'
            : 'https://topups.reloadly.com';

        const response = await axios.post('https://auth.reloadly.com/oauth/token', {
            client_id: credential.apiKey,
            client_secret: credential.apiSecret,
            grant_type: 'client_credentials',
            audience: audience
        });

        if (response.data) {
            const access_token = response.data.access_token;
            const countries = await this.getAllCountries(access_token, countriesUrl);
            const operators = await this.getAllOperators(access_token, operatorUrl);

            for (const country of countries) {
                await this.prisma.country.upsert({
                    where: { code: country.isoName },
                    update: {
                        name: country.name,
                        currencyCode: country.currencyCode,
                        currencyName: country.currencyName,
                        currencySymbol: country.currencySymbol,
                        flag: country.flag,
                        continent: country.continent || '',
                        callingCodes: country.callingCodes || [],
                    },
                    create: {
                        code: country.isoName,
                        name: country.name,
                        currencyCode: country.currencyCode,
                        currencyName: country.currencyName,
                        currencySymbol: country.currencySymbol,
                        flag: country.flag,
                        continent: country.continent || '',
                        callingCodes: country.callingCodes || [],
                    },
                });
            }

            for (const operator of operators) {
                await this.prisma.operator.upsert({
                    where: { operatorId: operator.operatorId },
                    update: {
                        name: operator.name,
                        bundle: operator.bundle,
                        data: operator.data,
                        pin: operator.pin,
                        comboProduct: operator.comboProduct,
                        supportsLocalAmounts: operator.supportsLocalAmounts,
                        supportsGeographicalRechargePlans: operator.supportsGeographicalRechargePlans,
                        denominationType: operator.denominationType,
                        senderCurrencyCode: operator.senderCurrencyCode,
                        senderCurrencySymbol: operator.senderCurrencySymbol,
                        destinationCurrencyCode: operator.destinationCurrencyCode,
                        destinationCurrencySymbol: operator.destinationCurrencySymbol,
                        commission: operator.commission,
                        internationalDiscount: operator.internationalDiscount,
                        localDiscount: operator.localDiscount,
                        mostPopularAmount: operator.mostPopularAmount,
                        mostPopularLocalAmount: operator.mostPopularLocalAmount,
                        minAmount: operator.minAmount,
                        maxAmount: operator.maxAmount,
                        localMinAmount: operator.localMinAmount,
                        localMaxAmount: operator.localMaxAmount,
                        countryCode: operator.country?.isoName || '',
                        fxRate: operator.fx?.rate || 0,
                        fxCurrencyCode: operator.fx?.currencyCode || '',
                        logoUrls: operator.logoUrls || [],
                        fixedAmounts: operator.fixedAmounts || [],
                        fixedAmountsDescriptions: operator.fixedAmountsDescriptions || {},
                        localFixedAmounts: operator.localFixedAmounts || [],
                        localFixedAmountsDescriptions: operator.localFixedAmountsDescriptions || {},
                        suggestedAmounts: operator.suggestedAmounts || [],
                        suggestedAmountsMap: operator.suggestedAmountsMap || {},
                        internationalFee: operator.fees?.international || 0,
                        localFee: operator.fees?.local || 0,
                        localPercentageFee: operator.fees?.localPercentage || 0,
                        internationalPercentageFee: operator.fees?.internationalPercentage || 0,
                        geographicalRechargePlans: operator.geographicalRechargePlans || [],
                        promotions: operator.promotions || [],
                        status: operator.status,
                    },
                    create: {
                        operatorId: operator.operatorId,
                        name: operator.name,
                        bundle: operator.bundle,
                        data: operator.data,
                        pin: operator.pin,
                        comboProduct: operator.comboProduct,
                        supportsLocalAmounts: operator.supportsLocalAmounts,
                        supportsGeographicalRechargePlans: operator.supportsGeographicalRechargePlans,
                        denominationType: operator.denominationType,
                        senderCurrencyCode: operator.senderCurrencyCode,
                        senderCurrencySymbol: operator.senderCurrencySymbol,
                        destinationCurrencyCode: operator.destinationCurrencyCode,
                        destinationCurrencySymbol: operator.destinationCurrencySymbol,
                        commission: operator.commission,
                        internationalDiscount: operator.internationalDiscount,
                        localDiscount: operator.localDiscount,
                        mostPopularAmount: operator.mostPopularAmount,
                        mostPopularLocalAmount: operator.mostPopularLocalAmount,
                        minAmount: operator.minAmount,
                        maxAmount: operator.maxAmount,
                        localMinAmount: operator.localMinAmount,
                        localMaxAmount: operator.localMaxAmount,
                        countryCode: operator.country?.isoName || '',
                        fxRate: operator.fx?.rate || 0,
                        fxCurrencyCode: operator.fx?.currencyCode || '',
                        logoUrls: operator.logoUrls || [],
                        fixedAmounts: operator.fixedAmounts || [],
                        fixedAmountsDescriptions: operator.fixedAmountsDescriptions || {},
                        localFixedAmounts: operator.localFixedAmounts || [],
                        localFixedAmountsDescriptions: operator.localFixedAmountsDescriptions || {},
                        suggestedAmounts: operator.suggestedAmounts || [],
                        suggestedAmountsMap: operator.suggestedAmountsMap || {},
                        internationalFee: operator.fees?.international || 0,
                        localFee: operator.fees?.local || 0,
                        localPercentageFee: operator.fees?.localPercentage || 0,
                        internationalPercentageFee: operator.fees?.internationalPercentage || 0,
                        geographicalRechargePlans: operator.geographicalRechargePlans || [],
                        promotions: operator.promotions || [],
                        status: operator.status,
                    },
                });
            }

            return {
                success: true,
                message: 'Data updated successfully'
            };
        }
    }
    async getAllOperators(access_token: string, operatorUrl: string) {
        const allOperators: any[] = [];
        let page = 0;
        let totalPages = 1;

        do {
            const response = await axios.get(`${operatorUrl}?page=${page}&size=200`, {
                headers: {
                    Authorization: `Bearer ${access_token}`
                }
            });

            const data = response.data;
            if (data && data.content) {
                allOperators.push(...data.content);
                totalPages = data.totalPages + 1;
                page++;
            } else {
                break;
            }
        } while (page < totalPages);

        return allOperators;
    }
    async getAllCountries(access_token: string, countriesUrl: string) {
        const allCountries: any[] = [];
        let page = 0;
        let totalPages = 1;

        do {
            const response = await axios.get(`${countriesUrl}?page=${page}&size=200`, {
                headers: {
                    Authorization: `Bearer ${access_token}`
                }
            });

            const data = response.data;
            if (Array.isArray(data.content)) {
                allCountries.push(...data.content);
                totalPages = data.totalPages;
                page++;
            } else if (Array.isArray(data)) {
                // Trường hợp không phân trang
                return data;
            } else {
                break;
            }
        } while (page < totalPages);

        return allCountries;
    }

}