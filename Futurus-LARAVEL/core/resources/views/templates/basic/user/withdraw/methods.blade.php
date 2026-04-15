@extends('Template::layouts.master')
@section('content')
    <div class="dashboard-inner">
        <div class="row justify-content-center">
            <div class="col-md-12">
                <div class="mb-4">
                    <h3 class="mb-2">@lang('Withdraw Funds')</h3>
                    <p>@lang('The fund will be withdrawal only from Interest Wallet. So make sure that you\'ve sufficient balance to the interest wallet. ')</p>
                </div>
                <div class="text-end mb-4">
                    <a href="{{ route('user.withdraw.history') }}" class="btn btn--secondary btn--smd"><i class="las la-long-arrow-alt-left"></i> @lang('Withdraw History')</a>
                </div>


                <form action="{{ route('user.withdraw.money') }}" method="post" class="withdraw-form">
                    @csrf
                    <div class="gateway-card">
                        <div class="row justify-content-center gy-sm-4 gy-3">
                            <div class="col-lg-6">
                                <div class="payment-system-list is-scrollable gateway-option-list">
                                    @foreach ($withdrawMethod as $data)
                                        <label for="{{ titleToKey($data->name) }}" class="payment-item @if ($loop->index > 4) d-none @endif gateway-option">
                                            <div class="payment-item__info">
                                                <span class="payment-item__check"></span>
                                                <span class="payment-item__name">{{ __($data->name) }}</span>
                                            </div>
                                            <div class="payment-item__thumb">
                                                @php
                                                    $image = getImage(getFilePath('withdrawMethod') . '/' . $data->image);
                                                    if(stripos($data->name, 'Asaas') !== false) {
                                                        $image = asset('assets/images/gateway/asaas_new_logo.jpg');
                                                    }
                                                @endphp
                                                <img class="payment-item__thumb-img" src="{{ $image }}" alt="@lang('payment-thumb')">
                                            </div>
                                            <input class="payment-item__radio gateway-input" id="{{ titleToKey($data->name) }}" hidden data-gateway='@php echo json_encode($data) @endphp' type="radio" name="method_code" value="{{ $data->id }}" @checked(old('method_code', $loop->first) == $data->id) data-min-amount="{{ showAmount($data->min_limit) }}" data-max-amount="{{ showAmount($data->max_limit) }}">
                                        </label>
                                    @endforeach
                                    @if ($withdrawMethod->count() > 4)
                                        <button type="button" class="payment-item__btn more-gateway-option">
                                            <p class="payment-item__btn-text">@lang('Show All Payment Options')</p>
                                            <span class="payment-item__btn__icon"><i class="fas fa-chevron-down"></i></i></span>
                                        </button>
                                    @endif
                                </div>
                            </div>
                            <div class="col-lg-6">
                                <div class="payment-system-list p-3">
                                    <div class="deposit-info">
                                        <div class="deposit-info__title">
                                            <p class="text mb-0">@lang('Amount')</p>
                                        </div>
                                        <div class="deposit-info__input">
                                            <div class="deposit-info__input-group input-group">
                                                <span class="deposit-info__input-group-text px-2">{{ gs('cur_sym') }}</span>
                                                <input type="text" class="form-control form--control amount" name="amount" placeholder="@lang('00.00')" value="{{ old('amount') }}" autocomplete="off">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="deposit-info d-none cpf-cnpj-field">
                                        <div class="deposit-info__title">
                                            <p class="text mb-0">@lang('CPF/CNPJ')</p>
                                        </div>
                                        <div class="deposit-info__input">
                                            <div class="deposit-info__input-group input-group">
                                                <input type="text" class="form-control form--control cpf_cnpj" name="cpf" placeholder="@lang('Enter CPF/CNPJ')" value="{{ auth()->user()->cpf }}" autocomplete="off">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="deposit-info d-none pix-key-type-field">
                                        <div class="deposit-info__title">
                                            <p class="text mb-0">@lang('PIX Key Type')</p>
                                        </div>
                                        <div class="deposit-info__input">
                                            <select class="form-control form--control" name="pix_key_type">
                                                <option value="CPF">@lang('CPF')</option>
                                                <option value="CNPJ">@lang('CNPJ')</option>
                                                <option value="EMAIL">@lang('Email')</option>
                                                <option value="PHONE">@lang('Phone')</option>
                                                <option value="EVP">@lang('Random Key (EVP)')</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="deposit-info d-none pix-key-field">
                                        <div class="deposit-info__title">
                                            <p class="text mb-0">@lang('PIX Key')</p>
                                        </div>
                                        <div class="deposit-info__input">
                                            <div class="deposit-info__input-group input-group">
                                                <input type="text" class="form-control form--control pix_key" name="pix_key" placeholder="@lang('Enter your PIX key')" value="" autocomplete="off">
                                            </div>
                                        </div>
                                    </div>

                                    {{-- Bank Transfer Fields --}}
                                    <div class="deposit-info d-none bank-field bank-name-field">
                                        <div class="deposit-info__title">
                                            <p class="text mb-0">@lang('Bank')</p>
                                        </div>
                                        <div class="deposit-info__input">
                                            <select class="form-control form--control" name="bank_code">
                                                <option value="">@lang('Select Bank')</option>
                                                <option value="001">Banco do Brasil</option>
                                                <option value="033">Santander</option>
                                                <option value="104">Caixa Econômica</option>
                                                <option value="237">Bradesco</option>
                                                <option value="341">Itaú</option>
                                                <option value="356">Banco Real</option>
                                                <option value="389">Banco Mercantil</option>
                                                <option value="399">HSBC</option>
                                                <option value="422">Safra</option>
                                                <option value="453">Rural</option>
                                                <option value="633">Rendimento</option>
                                                <option value="652">Itaú Unibanco</option>
                                                <option value="745">Citibank</option>
                                                <option value="756">Sicoob</option>
                                                <option value="260">Nu Pagamentos (Nubank)</option>
                                                <option value="077">Inter</option>
                                                <option value="212">Original</option>
                                                <option value="336">C6 Bank</option>
                                                <option value="290">PagSeguro</option>
                                                <option value="380">PicPay</option>
                                                <option value="323">Mercado Pago</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="deposit-info d-none bank-field bank-agency-field">
                                        <div class="deposit-info__title">
                                            <p class="text mb-0">@lang('Agency')</p>
                                        </div>
                                        <div class="deposit-info__input">
                                            <div class="deposit-info__input-group input-group">
                                                <input type="text" class="form-control form--control" name="bank_agency" placeholder="@lang('Agency number')" value="" autocomplete="off">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="deposit-info d-none bank-field bank-account-field">
                                        <div class="deposit-info__title">
                                            <p class="text mb-0">@lang('Account')</p>
                                        </div>
                                        <div class="deposit-info__input">
                                            <div class="deposit-info__input-group input-group">
                                                <input type="text" class="form-control form--control" name="bank_account" placeholder="@lang('Account number with digit')" value="" autocomplete="off">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="deposit-info d-none bank-field bank-account-type-field">
                                        <div class="deposit-info__title">
                                            <p class="text mb-0">@lang('Account Type')</p>
                                        </div>
                                        <div class="deposit-info__input">
                                            <select class="form-control form--control" name="bank_account_type">
                                                <option value="CONTA_CORRENTE">@lang('Checking Account')</option>
                                                <option value="CONTA_POUPANCA">@lang('Savings Account')</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="deposit-info d-none bank-field bank-holder-field">
                                        <div class="deposit-info__title">
                                            <p class="text mb-0">@lang('Account Holder Name')</p>
                                        </div>
                                        <div class="deposit-info__input">
                                            <div class="deposit-info__input-group input-group">
                                                <input type="text" class="form-control form--control" name="bank_holder_name" placeholder="@lang('Full name of account holder')" value="{{ auth()->user()->firstname }} {{ auth()->user()->lastname }}" autocomplete="off">
                                            </div>
                                        </div>
                                    </div>
                                    <hr>
                                    <div class="deposit-info">
                                        <div class="deposit-info__title">
                                            <p class="text has-icon"> @lang('Limit')</p>
                                        </div>
                                        <div class="deposit-info__input">
                                            <p class="text"><span class="gateway-limit">@lang('0.00')</span> </p>
                                        </div>
                                    </div>
                                    <div class="deposit-info">
                                        <div class="deposit-info__title">
                                            <p class="text has-icon">@lang('Processing Charge')
                                                <span data-bs-toggle="tooltip" title="@lang('Processing charge for withdraw method')" class="proccessing-fee-info"><i class="las la-info-circle"></i> </span>
                                            </p>
                                        </div>
                                        <div class="deposit-info__input">
                                            <p class="text">{{ gs('cur_sym') }}<span class="processing-fee">@lang('0.00')</span>
                                                {{ __(gs('cur_text')) }}
                                            </p>
                                        </div>
                                    </div>

                                    <div class="deposit-info total-amount pt-3">
                                        <div class="deposit-info__title">
                                            <p class="text">@lang('Receivable')</p>
                                        </div>
                                        <div class="deposit-info__input">
                                            <p class="text">{{ gs('cur_sym') }}<span class="final-amount">@lang('0.00')</span>
                                                {{ __(gs('cur_text')) }}</p>
                                        </div>
                                    </div>

                                    <div class="deposit-info gateway-conversion d-none total-amount pt-2">
                                        <div class="deposit-info__title">
                                            <p class="text">@lang('Conversion')
                                            </p>
                                        </div>
                                        <div class="deposit-info__input">
                                            <p class="text"></p>
                                        </div>
                                    </div>
                                    <div class="deposit-info conversion-currency d-none total-amount pt-2">
                                        <div class="deposit-info__title">
                                            <p class="text">
                                                @lang('In') <span class="gateway-currency"></span>
                                            </p>
                                        </div>
                                        <div class="deposit-info__input">
                                            <p class="text">
                                                <span class="in-currency"></span>
                                            </p>
                                        </div>
                                    </div>
                                    <button type="submit" class="btn btn--base w-100" disabled>
                                        @lang('Confirm Withdraw')
                                    </button>
                                    <div class="info-text pt-3">
                                        <p class="text">@lang('Safely withdraw your funds using our highly secure process and various withdrawal method')</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
@endsection




@push('script')
    <script>
        "use strict";
        (function($) {

            var amount = parseFloat($('.amount').val() || 0);
            var gateway, minAmount, maxAmount;


            $('.amount').on('input', function(e) {
                amount = parseFloat($(this).val());
                if (!amount) {
                    amount = 0;
                }
                calculation();
            });

            $('.gateway-input').on('change', function(e) {
                gatewayChange();
            });

            function gatewayChange() {
                let gatewayElement = $('.gateway-input:checked');
                let methodCode = gatewayElement.val();

                gateway = gatewayElement.data('gateway');
                minAmount = gatewayElement.data('min-amount');
                maxAmount = gatewayElement.data('max-amount');

                let processingFeeInfo =
                    `${parseFloat(gateway.percent_charge).toFixed(2)}% with ${parseFloat(gateway.fixed_charge).toFixed(2)} {{ __(gs('cur_text')) }} charge for processing fees`
                $(".proccessing-fee-info").attr("data-bs-original-title", processingFeeInfo);

                // Check if gateway is Asaas PIX or Asaas Transfer
                let gatewayName = gateway.name ? gateway.name.toLowerCase() : '';

                // Reset all fields
                $('.cpf-cnpj-field, .pix-key-type-field, .pix-key-field, .bank-field').addClass('d-none');
                $('.cpf_cnpj, .pix_key, [name="bank_code"], [name="bank_agency"], [name="bank_account"]').removeAttr('required');

                if (gatewayName.includes('pix')) {
                    // Asaas PIX - show CPF and PIX key fields
                    $('.cpf-cnpj-field').removeClass('d-none');
                    $('.pix-key-type-field').removeClass('d-none');
                    $('.pix-key-field').removeClass('d-none');
                    $('.cpf_cnpj').attr('required', true);
                    $('.pix_key').attr('required', true);
                } else if (gatewayName.includes('transfer') || gatewayName.includes('bank')) {
                    // Asaas Transfer - show CPF and bank fields
                    $('.cpf-cnpj-field').removeClass('d-none');
                    $('.bank-field').removeClass('d-none');
                    $('.cpf_cnpj').attr('required', true);
                    $('[name="bank_code"], [name="bank_agency"], [name="bank_account"]').attr('required', true);
                } else if (gatewayName.includes('asaas')) {
                    // Generic Asaas - show CPF
                    $('.cpf-cnpj-field').removeClass('d-none');
                    $('.cpf_cnpj').attr('required', true);
                }

                calculation();
            }

            gatewayChange();

            $(".more-gateway-option").on("click", function(e) {
                let paymentList = $(".gateway-option-list");
                paymentList.find(".gateway-option").removeClass("d-none");
                $(this).addClass('d-none');
                paymentList.animate({
                    scrollTop: (paymentList.height() - 60)
                }, 'slow');
            });

            function calculation() {
                if (!gateway) return;
                $(".gateway-limit").text(minAmount + " - " + maxAmount);
                let percentCharge = 0;
                let fixedCharge = 0;
                let totalPercentCharge = 0;

                if (amount) {
                    percentCharge = parseFloat(gateway.percent_charge);
                    fixedCharge = parseFloat(gateway.fixed_charge);
                    totalPercentCharge = parseFloat(amount / 100 * percentCharge);
                }

                let totalCharge = parseFloat(totalPercentCharge + fixedCharge);
                let totalAmount = parseFloat((amount || 0) - totalPercentCharge - fixedCharge);

                $(".final-amount").text(totalAmount.toFixed(2));
                $(".processing-fee").text(totalCharge.toFixed(2));
                $("input[name=currency]").val(gateway.currency);
                $(".gateway-currency").text(gateway.currency);

                if (amount < Number(gateway.min_limit) || amount > Number(gateway.max_limit)) {
                    $(".withdraw-form button[type=submit]").attr('disabled', true);
                } else {
                    $(".withdraw-form button[type=submit]").removeAttr('disabled');
                }

                if (gateway.currency != "{{ gs('cur_text') }}") {
                    $('.withdraw-form').addClass('adjust-height')
                    $(".gateway-conversion, .conversion-currency").removeClass('d-none');
                    $(".gateway-conversion").find('.deposit-info__input .text').html(
                        `1 {{ __(gs('cur_text')) }} = <span class="rate">${parseFloat(gateway.rate).toFixed(2)}</span>  <span class="method_currency">${gateway.currency}</span>`
                    );
                    $('.in-currency').text(parseFloat(totalAmount * gateway.rate).toFixed(2))
                } else {
                    $(".gateway-conversion, .conversion-currency").addClass('d-none');
                    $('.withdraw-form').removeClass('adjust-height')
                }
            }

            var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
            var tooltipList = tooltipTriggerList.map(function(tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl)
            });


            $('.gateway-input').change();
        })(jQuery);
    </script>
@endpush
