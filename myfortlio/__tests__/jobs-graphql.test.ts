import { expect, describe, it } from 'bun:test';
import { config } from '../config';
import crypto from 'crypto';

const { port } = config;
const BASE_URL = `http://localhost:${port}/user/graphql`;
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2M3ZDk2NzY0OGFhYmFlMWM1NzQ1YmMiLCJuYW1lIjoiQXJndXMgQWRtaW4iLCJyb2xlIjoiQWRtaW4iLCJzZXNzaW9uSWQiOiI0YjVmODJiMC0wOWUxLTRjZDYtYmZmOS05NzU5ZTMyMTlhMDAiLCJpYXQiOjE3NDM0MDg1ODYsImV4cCI6MTc3NDk0NDU4Nn0.nyeBa870yF11bhUyqF4Oyol0ltM_tCij5NIvSxF0GNE';

const secret = 'aa209c3cb736ed65aa13035b2ef74afceb3e1315b352caa012c174ecdfb31f5bbe1560b8ee5301434ddea5e7ee757319b87612197a63cf638880e3b85480e173';

const creditCoinsVariables: any = {
  input: {
    referralCode: 'TMP-047-792P',
    type: 'CREDIT',
    source: 'PURCHASE',
    remarks: 'for booking',
    clientCreateAt: new Date().toISOString(),
    coins: 100,
    metadata: {},
  },
};
const generateChecksum = async (data: string): Promise<string> => crypto
  .createHmac('sha256', secret)
  .update(data)
  .digest('hex');

const debitCoinsVariables: any = {
  input: {
    referralCode: 'TMP-047-792P',
    type: 'DEBIT',
    source: 'FAQ',
    remarks: 'for package',
    clientCreateAt: new Date().toISOString(),
    coins: 100,
    metadata: {},
  },
};

describe('Users API', () => {

  describe('Update Coins Operation', () => {
    it('should update coins for credit and debit using one mutation', async () => {
      const creditQuery: any = {
        query: `
          mutation UpdateCoins($input: UpdateCoinsInput!) {
            creditDebitCoins(input: $input) {
              userId
              coinBalance
            }
          }
        `,
        variables: creditCoinsVariables,
      };
      const checksum = await generateChecksum(JSON.stringify({ query: creditQuery.query, variables: creditQuery.variables }));
      // const receivedChecksum = req.headers['x-checksum'];

      const creditResponse = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-checksum': checksum,
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(creditQuery),
      });

      if (creditResponse.status !== 200) {
        throw new Error(`Expected 200, got ${creditResponse.status}`);
      }

      expect(creditResponse?.body.data.creditDebitCoins.userId).toBe(creditCoinsVariables.input.userId);
      expect(Number(creditResponse?.body.data.creditDebitCoins.coinBalance)).toBe(100);

    });

    it('should update coins for debit using the same mutation', async () => {
      const debitQuery = {
        query: `
          mutation UpdateCoins($input: UpdateCoinsInput!) {
            creditDebitCoins(input: $input) {
              userId
              coinBalance
            }
          }
        `,
        variables: debitCoinsVariables,
      };
      const checksum = await generateChecksum(JSON.stringify({ query: debitQuery.query, variables: debitQuery.variables }));

      const debitResponse = await request(BASE_URL)
        .post('/')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .set('x-checksum', checksum)
        .send(debitQuery)
        .expect(200);

      expect(debitResponse.body.data.creditDebitCoins.userId).toBe(debitCoinsVariables.input.userId);
      expect(Number(debitResponse.body.data.creditDebitCoins.coinBalance)).toBe(0);
    });
  });

});
