@extends('Template::layouts.master')
@section('content')
    <div class="dashboard-inner">
        <div class="row justify-content-center">
            <div class="col-lg-8">
                <div class="mb-4">
                    <h3 class="mb-2">@lang('Credit/Debit Card Payment')</h3>
                    <p>@lang('Please fill in all the required information to complete your payment.')</p>
                </div>

                <div class="card custom--card mb-4">
                    <div class="card-header">
                        <h5 class="mb-0">@lang('Payment Summary')</h5>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-6">
                                <p class="mb-1"><strong>@lang('Amount'):</strong></p>
                                <h4 class="text--base">{{ showAmount($deposit->amount) }}</h4>
                            </div>
                            <div class="col-6">
                                <p class="mb-1"><strong>@lang('Total with fees'):</strong></p>
                                <h4 class="text--success">{{ gs('cur_sym') }}{{ showAmount($deposit->final_amount, currencyFormat: false) }}</h4>
                            </div>
                        </div>
                        <p class="mb-0 mt-2 text-muted"><small>@lang('Transaction'): {{ $deposit->trx }}</small></p>
                    </div>
                </div>

                <form action="{{ route('user.deposit.asaas.card.submit', encrypt($deposit->id)) }}" method="post" id="cardForm">
                    @csrf

                    {{-- Card Information --}}
                    <div class="card custom--card mb-4">
                        <div class="card-header">
                            <h5 class="mb-0"><i class="las la-credit-card me-2"></i>@lang('Card Information')</h5>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-12 mb-3">
                                    <label class="form-label">@lang('Card Number') <span class="text-danger">*</span></label>
                                    <input type="text" name="card_number" class="form-control form--control"
                                           placeholder="0000 0000 0000 0000" maxlength="19"
                                           value="{{ old('card_number') }}" required
                                           oninput="formatCardNumber(this)">
                                </div>
                                <div class="col-12 mb-3">
                                    <label class="form-label">@lang('Cardholder Name') <span class="text-danger">*</span></label>
                                    <input type="text" name="holder_name" class="form-control form--control"
                                           placeholder="@lang('Name as shown on card')"
                                           value="{{ old('holder_name', $user->firstname . ' ' . $user->lastname) }}" required>
                                </div>
                                <div class="col-md-4 mb-3">
                                    <label class="form-label">@lang('Expiry Month') <span class="text-danger">*</span></label>
                                    <select name="expiry_month" class="form-control form--control" required>
                                        <option value="">@lang('Month')</option>
                                        @for($i = 1; $i <= 12; $i++)
                                            <option value="{{ str_pad($i, 2, '0', STR_PAD_LEFT) }}" @selected(old('expiry_month') == str_pad($i, 2, '0', STR_PAD_LEFT))>
                                                {{ str_pad($i, 2, '0', STR_PAD_LEFT) }}
                                            </option>
                                        @endfor
                                    </select>
                                </div>
                                <div class="col-md-4 mb-3">
                                    <label class="form-label">@lang('Expiry Year') <span class="text-danger">*</span></label>
                                    <select name="expiry_year" class="form-control form--control" required>
                                        <option value="">@lang('Year')</option>
                                        @for($i = date('Y'); $i <= date('Y') + 15; $i++)
                                            <option value="{{ $i }}" @selected(old('expiry_year') == $i)>{{ $i }}</option>
                                        @endfor
                                    </select>
                                </div>
                                <div class="col-md-4 mb-3">
                                    <label class="form-label">@lang('CVV') <span class="text-danger">*</span></label>
                                    <input type="text" name="cvv" class="form-control form--control"
                                           placeholder="000" maxlength="4"
                                           value="{{ old('cvv') }}" required
                                           oninput="this.value = this.value.replace(/[^0-9]/g, '')">
                                </div>
                                <div class="col-12 mb-3">
                                    <label class="form-label">@lang('Installments') <span class="text-danger">*</span></label>
                                    <select name="installments" class="form-control form--control" required>
                                        @for($i = 1; $i <= 12; $i++)
                                            @php
                                                $installmentValue = $deposit->final_amount / $i;
                                            @endphp
                                            <option value="{{ $i }}" @selected(old('installments', 1) == $i)>
                                                {{ $i }}x {{ gs('cur_sym') }}{{ number_format($installmentValue, 2, ',', '.') }}
                                                @if($i == 1) (@lang('No interest')) @endif
                                            </option>
                                        @endfor
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {{-- Cardholder Information --}}
                    <div class="card custom--card mb-4">
                        <div class="card-header">
                            <h5 class="mb-0"><i class="las la-user me-2"></i>@lang('Cardholder Information')</h5>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">@lang('CPF/CNPJ') <span class="text-danger">*</span></label>
                                    <input type="text" name="holder_cpf" class="form-control form--control"
                                           placeholder="000.000.000-00"
                                           value="{{ old('holder_cpf', $user->cpf) }}" required
                                           oninput="formatCPF(this)">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">@lang('Email') <span class="text-danger">*</span></label>
                                    <input type="email" name="holder_email" class="form-control form--control"
                                           placeholder="email@example.com"
                                           value="{{ old('holder_email', $user->email) }}" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">@lang('Phone') <span class="text-danger">*</span></label>
                                    <input type="text" name="holder_phone" class="form-control form--control"
                                           placeholder="(00) 00000-0000"
                                           value="{{ old('holder_phone', $user->mobile) }}" required
                                           oninput="formatPhone(this)">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">@lang('Postal Code (CEP)') <span class="text-danger">*</span></label>
                                    <input type="text" name="holder_postal_code" class="form-control form--control"
                                           placeholder="00000-000" maxlength="9"
                                           value="{{ old('holder_postal_code') }}" required
                                           oninput="formatCEP(this)">
                                </div>
                            </div>
                        </div>
                    </div>

                    {{-- Billing Address --}}
                    <div class="card custom--card mb-4">
                        <div class="card-header">
                            <h5 class="mb-0"><i class="las la-map-marker me-2"></i>@lang('Billing Address')</h5>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-8 mb-3">
                                    <label class="form-label">@lang('Street Address') <span class="text-danger">*</span></label>
                                    <input type="text" name="holder_address" class="form-control form--control"
                                           placeholder="@lang('Street name')"
                                           value="{{ old('holder_address', $user->address->address ?? '') }}" required>
                                </div>
                                <div class="col-md-4 mb-3">
                                    <label class="form-label">@lang('Number') <span class="text-danger">*</span></label>
                                    <input type="text" name="holder_address_number" class="form-control form--control"
                                           placeholder="@lang('Number')"
                                           value="{{ old('holder_address_number') }}" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">@lang('Neighborhood') <span class="text-danger">*</span></label>
                                    <input type="text" name="holder_province" class="form-control form--control"
                                           placeholder="@lang('Neighborhood/Province')"
                                           value="{{ old('holder_province') }}" required>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="d-flex gap-2">
                        <a href="{{ route('user.deposit.history') }}" class="btn btn--secondary flex-grow-1">
                            <i class="las la-times"></i> @lang('Cancel')
                        </a>
                        <button type="submit" class="btn btn--base flex-grow-1" id="submitBtn">
                            <i class="las la-lock"></i> @lang('Pay') {{ gs('cur_sym') }}{{ showAmount($deposit->final_amount, currencyFormat: false) }}
                        </button>
                    </div>

                    <div class="text-center mt-3">
                        <p class="text-muted mb-0">
                            <i class="las la-shield-alt"></i> @lang('Your payment is secured with SSL encryption')
                        </p>
                    </div>
                </form>
            </div>
        </div>
    </div>
@endsection

@push('style')
<style>
    .card-header {
        background: linear-gradient(135deg, var(--base-color) 0%, var(--base-color-dark, var(--base-color)) 100%);
        color: #fff;
    }
    .card-header h5 {
        color: #fff;
    }
    .form-label {
        font-weight: 500;
        margin-bottom: 0.5rem;
    }
    .text-danger {
        color: #dc3545 !important;
    }
</style>
@endpush

@push('script')
<script>
    function formatCardNumber(input) {
        let value = input.value.replace(/\D/g, '');
        value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
        input.value = value.substring(0, 19);
    }

    function formatCPF(input) {
        let value = input.value.replace(/\D/g, '');
        if (value.length <= 11) {
            // CPF format: 000.000.000-00
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        } else {
            // CNPJ format: 00.000.000/0000-00
            value = value.replace(/^(\d{2})(\d)/, '$1.$2');
            value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
            value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
            value = value.replace(/(\d{4})(\d{1,2})$/, '$1-$2');
        }
        input.value = value;
    }

    function formatPhone(input) {
        let value = input.value.replace(/\D/g, '');
        if (value.length <= 10) {
            value = value.replace(/(\d{2})(\d)/, '($1) $2');
            value = value.replace(/(\d{4})(\d)/, '$1-$2');
        } else {
            value = value.replace(/(\d{2})(\d)/, '($1) $2');
            value = value.replace(/(\d{5})(\d)/, '$1-$2');
        }
        input.value = value;
    }

    function formatCEP(input) {
        let value = input.value.replace(/\D/g, '');
        value = value.replace(/(\d{5})(\d)/, '$1-$2');
        input.value = value.substring(0, 9);
    }

    // Prevent double submission
    document.getElementById('cardForm').addEventListener('submit', function(e) {
        const btn = document.getElementById('submitBtn');
        btn.disabled = true;
        btn.innerHTML = '<i class="las la-spinner la-spin"></i> @lang("Processing...")';
    });
</script>
@endpush
