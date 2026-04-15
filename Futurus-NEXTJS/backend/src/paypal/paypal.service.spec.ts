import { Test, TestingModule } from '@nestjs/testing';
import { PaypalService } from './paypal.service';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from 'decimal.js';

describe('PaypalService Arithmetic Precision', () => {
  let service: PaypalService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const mockPrisma = {
      gatewayCurrency: {
        findFirst: jest.fn(),
      },
      deposit: {
        create: jest.fn().mockImplementation((args) => Promise.resolve({ 
          ...args.data, 
          id: 1, 
          createdAt: new Date()
        })),
        findFirst: jest.fn(),
      },
      user: {
        update: jest.fn().mockResolvedValue({ id: 1, balance: new Decimal(100) }),
      },
      transaction: {
        create: jest.fn().mockResolvedValue({ id: 1 }),
      },
      adminNotification: {
        create: jest.fn().mockResolvedValue({ id: 1 }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaypalService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<PaypalService>(PaypalService);
    prisma = module.get<PrismaService>(PrismaService);

    // Mock global fetch for PayPal API
    global.fetch = jest.fn() as jest.Mock;
  });

  it('should format amounts correctly for PayPal API using toFixed(2)', async () => {
    (prisma.gatewayCurrency.findFirst as jest.Mock).mockResolvedValue({
      methodCode: 201,
      gatewayParameter: JSON.stringify({ client_id: 'test', client_secret: 'test', mode: 'sandbox' }),
      gateway: { name: 'PayPal' }
    });

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ access_token: 'fake_token' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'PAYPAL_ORDER_ID', links: [{ rel: 'approve', href: 'http://approve' }] }),
      });

    const amount = 100.33333333; // More than 2 decimal places
    const result = await service.processDeposit(1, { amount });

    expect(result.success).toBe(true);
    
    // Verify fetch call to create order
    const fetchCalls = (global.fetch as jest.Mock).mock.calls;
    const orderBody = JSON.parse(fetchCalls[1][1].body);
    
    // PayPal expects string with exactly 2 decimal places
    expect(orderBody.purchase_units[0].amount.value).toBe('100.33');
    
    // Verify database record uses Decimal
    const createCall = (prisma.deposit.create as jest.Mock).mock.calls[0][0];
    expect(createCall.data.amount instanceof Decimal).toBe(true);
    expect(createCall.data.amount.toString()).toBe('100.33333333');
  });

  it('should handle zero-sum floating point errors in deposits', async () => {
    // Similar to 0.1 + 0.2
    const amount = 0.1 + 0.2; // 0.30000000000000004
    
    (prisma.gatewayCurrency.findFirst as jest.Mock).mockResolvedValue({
      methodCode: 201,
      gatewayParameter: JSON.stringify({ client_id: 'test', client_secret: 'test', mode: 'sandbox' }),
      gateway: { name: 'PayPal' }
    });

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ access_token: 'fake_token' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'PAYPAL_ORDER_ID', links: [{ rel: 'approve', href: 'http://approve' }] }),
      });

    const result = await service.processDeposit(1, { amount });
    
    const fetchCalls = (global.fetch as jest.Mock).mock.calls;
    const orderBody = JSON.parse(fetchCalls[1][1].body);
    expect(orderBody.purchase_units[0].amount.value).toBe('0.30');
  });
});
