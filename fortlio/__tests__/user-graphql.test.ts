import { expect, describe, it } from 'bun:test';
import { config } from '../config';
import crypto from 'crypto';
import { AppError } from '../src/core/core-utils/err-util';

const { port } = config;
const BASE_URL = `http://localhost:${port}/user/graphql`;
const token = 'token';

const secret = 'secret';

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
        throw new AppError(`Expected 200, got ${creditResponse.status}`);
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
