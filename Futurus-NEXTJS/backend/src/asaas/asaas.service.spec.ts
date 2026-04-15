import { Test, TestingModule } from '@nestjs/testing';
import { AsaasService } from './asaas.service';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from 'decimal.js';
import { BadRequestException } from '@nestjs/common';

describe('AsaasService Arithmetic Precision', () => {
  let service: AsaasService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const mockPrisma = {
      $transaction: jest.fn((callback) => {
        const tx = {
          withdrawal: { 
            create: jest.fn().mockImplementation((args) => Promise.resolve({ 
              ...args.data, 
              id: 1, 
              trx: 'TESTTRX',
              createdAt: new Date()
            })) 
          },
          user: { 
            update: jest.fn().mockImplementation((args) => Promise.resolve({ 
              id: args.where.id,
              balance: args.data.balance 
            }))
          },
          transaction: { create: jest.fn().mockResolvedValue({ id: 1 }) },
          adminNotification: { create: jest.fn().mockResolvedValue({ id: 1 }) },
        };
        return callback(tx);
      }),
      withdrawMethod: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
      withdrawal: {
        create: jest.fn(),
        findFirst: jest.fn(),
      },
      generalSetting: {
        findFirst: jest.fn(),
      },
      transaction: {
        create: jest.fn(),
      },
      adminNotification: {
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AsaasService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<AsaasService>(AsaasService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should calculate withdrawal amounts with correct floating point precision', async () => {
    const mockUser = { id: 1, balance: new Decimal(1000), username: 'testuser' };
    const mockMethod = {
      id: 1,
      name: 'PIX',
      fixedCharge: new Decimal(0.50),
      percentCharge: new Decimal(1.5),
      rate: new Decimal(1.0),
      minLimit: new Decimal(10),
      maxLimit: new Decimal(10000),
      currency: 'BRL'
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (prisma.withdrawMethod.findFirst as jest.Mock).mockResolvedValue(mockMethod);

    const result = await (service as any).processWithdraw(
      1,
      mockMethod,
      100.33,
      '12345678901',
      []
    );

    expect(result.success).toBe(true);
    
    // 100.33 * 0.015 = 1.50495
    // 0.50 + 1.50495 = 2.00495
    const expectedCharge = new Decimal(0.50).plus(new Decimal(100.33).times(1.5).div(100));
    const expectedFinal = new Decimal(100.33).minus(expectedCharge);
    
    expect(result.data.withdraw.charge.toString()).toBe(expectedCharge.toString());
    expect(result.data.withdraw.final_amount.toString()).toBe(expectedFinal.toString());
  });

  it('should handle complex floating point balances correctly (0.1 + 0.2 precision)', async () => {
    const initialBalance = new Decimal(0.3);
    const mockUser = { id: 1, balance: initialBalance, username: 'testuser' };
    const mockMethod = {
      id: 1,
      name: 'PIX',
      fixedCharge: new Decimal(0),
      percentCharge: new Decimal(0),
      rate: new Decimal(1),
      minLimit: new Decimal(0.01),
      maxLimit: new Decimal(10),
      currency: 'BRL'
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

    const withdrawAmount = 0.1 + 0.2; // 0.30000000000000004
    
    await expect((service as any).processWithdraw(
      1,
      mockMethod,
      withdrawAmount,
      '12345678901',
      []
    )).rejects.toThrow(BadRequestException);
  });
});
