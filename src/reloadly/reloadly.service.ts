import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from 'src/prisma/prisma.service';
export interface TopupRequest {
    operatorId: number; // ID nhà mạng
    amount: string | number; // Số tiền nạp (bằng EUR nếu useLocalAmount là false)
    useLocalAmount: boolean; // false nếu nạp bằng EUR, true nếu dùng tiền địa phương
    recipientPhone: {
        countryCode: string; // Mã quốc gia (ISO), ví dụ: 'GB'
        number: string;      // Số điện thoại người nhận
    };
    customIdentifier?: string;   // (Tùy chọn) Mã theo dõi tùy chỉnh
    recipientEmail?: string;     // (Tùy chọn) Email người nhận
    senderPhone?: {
        countryCode: string;
        number: string;
    };
}

@Injectable()
export class ReloadlyService {
    constructor(private prisma: PrismaService) { }
    async createTopupReloadly(data: TopupRequest & { transactionId?: string }) {
        const credential: any = await this.prisma.apiCredential.findFirst({
          where: { type: 'TOPUP' }
        });
      
        if (!credential) throw new Error('No API credential found.');
      
        const mode: any = credential?.metadata?.mode;
        const url = mode === 'sandbox'
          ? 'https://topups-sandbox.reloadly.com/topups'
          : 'https://topups.reloadly.com/topups';
        const audience = mode === 'sandbox'
          ? 'https://topups-sandbox.reloadly.com'
          : 'https://topups.reloadly.com';
      
        try {
          const tokenRes = await axios.post('https://auth.reloadly.com/oauth/token', {
            client_id: credential.apiKey,
            client_secret: credential.apiSecret,
            grant_type: 'client_credentials',
            audience
          });
      
          const access_token = tokenRes.data?.access_token;
          if (!access_token) throw new Error('Failed to get access token.');
      
          let transactionId = data.transactionId;
          if (transactionId) {
            const transaction = await this.prisma.transaction.findUnique({
              where: { id: transactionId }
            });
            if (transaction) {
              data.amount = Number(transaction.amount);
            }
            delete data.transactionId;
          }
      
          const responseTopup = await axios.post(url, data, {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/com.reloadly.topups-v1+json',
              Authorization: `Bearer ${access_token}`
            }
          });
      
          if (transactionId) {
            const status = responseTopup.data.status === 'SUCCESSFUL'
              ? 'SUCCESS-SUCCESS'
              : 'SUCCESS-FAILED';
      
            await this.prisma.transaction.update({
              where: { id: transactionId },
              data: { status }
            });
          }
      
          return responseTopup.data;
        } catch (error) {
          console.error('Topup Error:', error.response?.data || error.message);
          throw new Error('Topup process failed.');
        }
      }
      
}
