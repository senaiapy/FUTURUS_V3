# Futurus Brasil - Deposit & Withdraw API Documentation

## Overview

This document describes the API endpoints for deposit and withdrawal operations via Asaas payment gateway. All endpoints are designed for mobile app integration and use server-side API keys (no client credentials required).

## Base URL

```
Production: https://futurus-brasil.com/api
Sandbox: https://sandbox.futurus-brasil.com/api
```

## Authentication

All endpoints require authentication using Bearer token (Laravel Sanctum).

```
Authorization: Bearer {token}
```

### Get Token

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "1|abc123..."
  }
}
```

---

## Balance

### Get User Balance

```http
GET /api/asaas/balance
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "balance": 1500.00,
    "currency": "BRL",
    "symbol": "R$"
  }
}
```

---

## Deposit Endpoints

### List Deposit Methods

```http
GET /api/asaas/deposit/methods
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "methods": [
      {
        "id": 1,
        "method_code": 127,
        "name": "Asaas PIX",
        "currency": "BRL",
        "min_amount": 1.00,
        "max_amount": 100000.00,
        "fixed_charge": 0.00,
        "percent_charge": 0.00,
        "type": "pix"
      },
      {
        "id": 2,
        "method_code": 128,
        "name": "Asaas Credit Card",
        "currency": "BRL",
        "min_amount": 10.00,
        "max_amount": 50000.00,
        "fixed_charge": 0.49,
        "percent_charge": 3.99,
        "type": "credit_card"
      }
    ]
  }
}
```

---

### Create PIX Deposit

```http
POST /api/asaas/deposit/pix
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 100.00,
  "cpf": "12345678900"
}
```

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| amount | number | Yes | Deposit amount (min: 1.00) |
| cpf | string | Yes | CPF or CNPJ (numbers only or formatted) |

**Response:**
```json
{
  "success": true,
  "message": "PIX payment created successfully",
  "data": {
    "deposit": {
      "trx": "ABC123XYZ",
      "amount": 100.00,
      "charge": 0.00,
      "final_amount": 100.00,
      "status": "pending"
    },
    "pix": {
      "qr_code_base64": "iVBORw0KGgoAAAANSUhEUgAA...",
      "copy_paste": "00020126580014br.gov.bcb.pix...",
      "expires_at": "2024-01-16 15:30:00"
    }
  }
}
```

---

### Create Credit/Debit Card Deposit

```http
POST /api/asaas/deposit/card
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 150.00,
  "card_number": "5162306219378829",
  "holder_name": "JOHN DOE",
  "expiry_month": "12",
  "expiry_year": "2028",
  "cvv": "123",
  "installments": 3,
  "holder_cpf": "12345678900",
  "holder_email": "john@example.com",
  "holder_phone": "11999998888",
  "holder_postal_code": "01310100",
  "holder_address": "Av Paulista",
  "holder_address_number": "1000",
  "holder_province": "Bela Vista"
}
```

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| amount | number | Yes | Deposit amount (min: 10.00) |
| card_number | string | Yes | Card number (13-19 digits) |
| holder_name | string | Yes | Name as shown on card |
| expiry_month | string | Yes | Expiry month (01-12) |
| expiry_year | string | Yes | Expiry year (4 digits) |
| cvv | string | Yes | Security code (3-4 digits) |
| installments | integer | Yes | Number of installments (1-12) |
| holder_cpf | string | Yes | CPF or CNPJ |
| holder_email | string | Yes | Email address |
| holder_phone | string | Yes | Phone number |
| holder_postal_code | string | Yes | CEP (postal code) |
| holder_address | string | Yes | Street address |
| holder_address_number | string | Yes | Address number |
| holder_province | string | Yes | Neighborhood/Province |

**Response (Success):**
```json
{
  "success": true,
  "message": "Payment confirmed successfully!",
  "data": {
    "deposit": {
      "trx": "ABC123XYZ",
      "amount": 150.00,
      "charge": 6.48,
      "final_amount": 156.48,
      "status": "confirmed"
    }
  }
}
```

**Response (Pending):**
```json
{
  "success": true,
  "message": "Payment is being processed",
  "data": {
    "deposit": {
      "trx": "ABC123XYZ",
      "amount": 150.00,
      "charge": 6.48,
      "final_amount": 156.48,
      "status": "pending"
    }
  }
}
```

---

### Check Deposit Status

```http
POST /api/asaas/deposit/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "trx": "ABC123XYZ"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "deposit": {
      "trx": "ABC123XYZ",
      "amount": 100.00,
      "charge": 0.00,
      "final_amount": 100.00,
      "status": "confirmed",
      "method": "pix",
      "created_at": "2024-01-15T10:30:00.000000Z"
    }
  }
}
```

**Status Values:**
- `pending` - Awaiting payment
- `processing` - Being processed
- `confirmed` - Payment confirmed, balance updated
- `rejected` - Payment rejected

---

## Withdraw Endpoints

### List Withdraw Methods

```http
GET /api/asaas/withdraw/methods
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "methods": [
      {
        "id": 1,
        "name": "Asaas PIX",
        "currency": "BRL",
        "min_limit": 10.00,
        "max_limit": 50000.00,
        "fixed_charge": 0.00,
        "percent_charge": 1.00,
        "type": "pix",
        "required_fields": [
          {"name": "cpf", "label": "CPF/CNPJ", "type": "text", "required": true},
          {"name": "pix_key_type", "label": "PIX Key Type", "type": "select", "required": true, "options": ["CPF", "CNPJ", "EMAIL", "PHONE", "EVP"]},
          {"name": "pix_key", "label": "PIX Key", "type": "text", "required": true}
        ]
      },
      {
        "id": 2,
        "name": "Asaas Transfer",
        "currency": "BRL",
        "min_limit": 10.00,
        "max_limit": 50000.00,
        "fixed_charge": 0.00,
        "percent_charge": 1.50,
        "type": "bank_transfer",
        "required_fields": [
          {"name": "cpf", "label": "CPF/CNPJ", "type": "text", "required": true},
          {"name": "bank_code", "label": "Bank Code", "type": "text", "required": true},
          {"name": "bank_agency", "label": "Agency", "type": "text", "required": true},
          {"name": "bank_account", "label": "Account", "type": "text", "required": true},
          {"name": "bank_account_type", "label": "Account Type", "type": "select", "required": true, "options": ["CONTA_CORRENTE", "CONTA_POUPANCA"]},
          {"name": "bank_holder_name", "label": "Account Holder Name", "type": "text", "required": true}
        ]
      }
    ]
  }
}
```

---

### Create PIX Withdraw

```http
POST /api/asaas/withdraw/pix
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 500.00,
  "cpf": "12345678900",
  "pix_key_type": "EMAIL",
  "pix_key": "user@example.com"
}
```

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| amount | number | Yes | Withdraw amount |
| cpf | string | Yes | CPF or CNPJ |
| pix_key_type | string | Yes | PIX key type: CPF, CNPJ, EMAIL, PHONE, EVP |
| pix_key | string | Yes | PIX key value |

**PIX Key Types:**
- `CPF` - CPF number
- `CNPJ` - CNPJ number
- `EMAIL` - Email address
- `PHONE` - Phone number (+5511999998888)
- `EVP` - Random key (UUID format)

**Response:**
```json
{
  "success": true,
  "message": "Withdraw request submitted successfully",
  "data": {
    "withdraw": {
      "trx": "WTH123ABC",
      "amount": 500.00,
      "charge": 5.00,
      "final_amount": 495.00,
      "status": "pending",
      "method": "Asaas PIX"
    },
    "balance": 1000.00
  }
}
```

---

### Create Bank Transfer Withdraw

```http
POST /api/asaas/withdraw/transfer
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 1000.00,
  "cpf": "12345678900",
  "bank_code": "001",
  "bank_agency": "1234",
  "bank_account": "12345-6",
  "bank_account_type": "CONTA_CORRENTE",
  "bank_holder_name": "John Doe"
}
```

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| amount | number | Yes | Withdraw amount |
| cpf | string | Yes | CPF or CNPJ |
| bank_code | string | Yes | Bank code (e.g., 001 for BB, 341 for Itaú) |
| bank_agency | string | Yes | Agency number |
| bank_account | string | Yes | Account number with digit |
| bank_account_type | string | Yes | CONTA_CORRENTE or CONTA_POUPANCA |
| bank_holder_name | string | Yes | Account holder full name |

**Common Bank Codes:**
- `001` - Banco do Brasil
- `033` - Santander
- `104` - Caixa Econômica
- `237` - Bradesco
- `341` - Itaú
- `756` - Sicoob
- `077` - Inter
- `260` - Nubank

**Response:**
```json
{
  "success": true,
  "message": "Withdraw request submitted successfully",
  "data": {
    "withdraw": {
      "trx": "WTH456DEF",
      "amount": 1000.00,
      "charge": 15.00,
      "final_amount": 985.00,
      "status": "pending",
      "method": "Asaas Transfer"
    },
    "balance": 500.00
  }
}
```

---

### Check Withdraw Status

```http
POST /api/asaas/withdraw/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "trx": "WTH123ABC"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "withdraw": {
      "trx": "WTH123ABC",
      "amount": 500.00,
      "charge": 5.00,
      "final_amount": 495.00,
      "status": "completed",
      "method": "Asaas PIX",
      "created_at": "2024-01-15T10:30:00.000000Z"
    }
  }
}
```

**Status Values:**
- `initiated` - Request created
- `pending` - Awaiting processing
- `completed` - Transfer completed
- `rejected` - Request rejected

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description here"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `401` - Unauthorized (invalid/missing token)
- `404` - Resource not found
- `422` - Validation error
- `500` - Server error

**Validation Error Example:**
```json
{
  "success": false,
  "message": "The amount field is required.",
  "errors": {
    "amount": ["The amount field is required."]
  }
}
```

---

## Webhooks (Server-Side)

Asaas sends webhooks to notify payment status changes:

- **PIX IPN:** `POST /ipn/asaas`
- **Card IPN:** `POST /ipn/asaas-card`

These are handled server-side and automatically update deposit status.

---

## Mobile Integration Notes

1. **Token Storage:** Store the authentication token securely (Keychain/Keystore)
2. **CPF Formatting:** API accepts both formatted (123.456.789-00) and unformatted (12345678900)
3. **Card Number:** Send without spaces or dashes
4. **Phone Number:** Include country code for PIX (e.g., +5511999998888)
5. **PIX QR Code:** Display the base64 image and allow copy of the copy_paste code
6. **Polling:** For PIX deposits, poll `/deposit/status` every 5-10 seconds until confirmed
7. **KYC Required:** Withdraw endpoints require completed KYC verification

---

## Rate Limits

- **Authentication:** 5 requests/minute per IP
- **Deposit/Withdraw:** 10 requests/minute per user
- **Status Check:** 30 requests/minute per user

---

## Support

For API issues, contact: api@futurus-brasil.com
