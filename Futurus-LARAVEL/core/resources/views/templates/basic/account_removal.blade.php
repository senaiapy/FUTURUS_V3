@extends('Template::layouts.frontend')
@section('content')

    <section class="account-removal-section my-100">
        <div class="auto-container">
            <div class="row justify-content-center">
                <div class="col-lg-8 col-xl-6">
                    <div class="text-center mb-5">
                        <div class="removal-icon mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="80" height="80" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="hsl(var(--danger))" stroke-width="1.5"/>
                                <path d="M12 6V14" stroke="hsl(var(--danger))" stroke-width="1.5" stroke-linecap="round"/>
                                <circle cx="12" cy="17" r="1" fill="hsl(var(--danger))"/>
                            </svg>
                        </div>
                        <h2 class="section-title">@lang('Remover Conta')</h2>
                        <p class="section-desc text-muted">@lang('Solicite a remoção dos seus dados da nossa plataforma')</p>
                    </div>

                    <div class="removal-card">
                        {{-- Warning Section --}}
                        <div class="warning-box mb-4">
                            <div class="d-flex align-items-start gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" class="flex-shrink-0 mt-1">
                                    <path d="M5.32171 9.6829C7.73539 5.41196 8.94222 3.27648 10.5983 2.72678C11.5093 2.42437 12.4907 2.42437 13.4017 2.72678C15.0578 3.27648 16.2646 5.41196 18.6783 9.6829C21.092 13.9538 22.2988 16.0893 21.9368 17.8293C21.7376 18.7866 21.2469 19.6548 20.535 20.3097C19.241 21.5 16.8274 21.5 12 21.5C7.17265 21.5 4.75897 21.5 3.46496 20.3097C2.75308 19.6548 2.26239 18.7866 2.06322 17.8293C1.70119 16.0893 2.90803 13.9538 5.32171 9.6829Z" stroke="hsl(var(--warning))" stroke-width="1.5"/>
                                    <path d="M12 8V13" stroke="hsl(var(--warning))" stroke-width="1.5" stroke-linecap="round"/>
                                    <circle cx="12" cy="16" r="1" fill="hsl(var(--warning))"/>
                                </svg>
                                <div>
                                    <h5 class="warning-title">@lang('Atenção')</h5>
                                    <p class="warning-text mb-0">
                                        @lang('Ao solicitar a remoção da sua conta, todos os seus dados pessoais, histórico de transações e informações associadas serão permanentemente excluídos dos nossos sistemas. Esta ação é irreversível.')
                                    </p>
                                </div>
                            </div>
                        </div>

                        @if(session('sent'))
                            {{-- Success Message --}}
                            <div class="success-box text-center py-5">
                                <div class="success-icon mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="64" height="64" fill="none">
                                        <circle cx="12" cy="12" r="10" stroke="hsl(var(--success))" stroke-width="1.5"/>
                                        <path d="M8 12L11 15L16 9" stroke="hsl(var(--success))" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </div>
                                <h4 class="text-success mb-2">@lang('Solicitação Enviada!')</h4>
                                <p class="text-muted">@lang('Sua solicitação foi recebida. Processaremos em até 30 dias úteis conforme a LGPD.')</p>
                            </div>
                        @else
                            {{-- Form Section --}}
                            <div class="form-inner">
                                <h5 class="form-section-title mb-4">@lang('Preencha os dados abaixo')</h5>

                                <form method="POST" class="verify-gcaptcha">
                                    @csrf
                                    <div class="row">
                                        <div class="col-12">
                                            <div class="form-group">
                                                <label for="name" class="form--label">@lang('Nome Completo') <span class="text-danger">*</span></label>
                                                <input type="text" id="name" name="name"
                                                       class="form--control form-control"
                                                       placeholder="@lang('Seu nome completo cadastrado')"
                                                       value="{{ old('name', $user?->fullname) }}"
                                                       required>
                                            </div>
                                        </div>
                                        <div class="col-12">
                                            <div class="form-group">
                                                <label for="email" class="form--label">@lang('E-mail da Conta') <span class="text-danger">*</span></label>
                                                <input type="email" id="email" name="email"
                                                       class="form--control form-control"
                                                       placeholder="@lang('E-mail associado à sua conta')"
                                                       value="{{ old('email', $user?->email) }}"
                                                       required>
                                            </div>
                                        </div>
                                        <div class="col-12">
                                            <div class="form-group">
                                                <label for="username" class="form--label">@lang('Nome de Usuário (Username)') <span class="text-danger">*</span></label>
                                                <input type="text" id="username" name="username"
                                                       class="form--control form-control"
                                                       placeholder="@lang('Seu username na plataforma')"
                                                       value="{{ old('username', $user?->username) }}"
                                                       required>
                                            </div>
                                        </div>
                                        <div class="col-12">
                                            <div class="form-group">
                                                <label for="reason" class="form--label">
                                                    @lang('Motivo da Solicitação')
                                                    <span class="text-muted small">(@lang('opcional'))</span>
                                                </label>
                                                <textarea id="reason" name="reason"
                                                          class="form--control form-control"
                                                          rows="4"
                                                          placeholder="@lang('Conte-nos por que deseja remover sua conta...')">{{ old('reason') }}</textarea>
                                            </div>
                                        </div>
                                        <div class="col-12">
                                            <x-captcha frontend="true" />
                                        </div>
                                        <div class="col-12">
                                            <button type="submit" class="w-100 theme-btn btn-danger">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" class="me-2">
                                                    <path d="M21.0477 3.05293C18.8697 0.707363 2.48648 6.4532 2.50001 8.551C2.51535 10.9299 8.89809 11.6617 10.6672 12.1581C11.7311 12.4565 12.016 12.7625 12.2613 13.8781C13.3723 18.9305 13.9301 21.4435 15.2014 21.4996C17.2278 21.5892 23.1733 5.342 21.0477 3.05293Z" stroke="currentColor" stroke-width="1.5" />
                                                    <path d="M11.4999 12.5L14.9999 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                </svg>
                                                @lang('Enviar Solicitação')
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>

                            {{-- Alternative Email Section --}}
                            <div class="divider my-4">
                                <span>@lang('ou')</span>
                            </div>

                            <div class="email-box">
                                <div class="d-flex flex-column flex-sm-row align-items-center gap-3">
                                    <div class="email-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="none">
                                            <path d="M2 6L8.91302 9.91697C11.4616 11.361 12.5384 11.361 15.087 9.91697L22 6" stroke="hsl(var(--base))" stroke-width="1.5" stroke-linejoin="round" />
                                            <path d="M2.01577 13.4756C2.08114 16.5412 2.11382 18.0739 3.24495 19.2094C4.37608 20.3448 5.95033 20.3843 9.09883 20.4634C11.0393 20.5122 12.9607 20.5122 14.9012 20.4634C18.0497 20.3843 19.6239 20.3448 20.7551 19.2094C21.8862 18.0739 21.9189 16.5412 21.9842 13.4756C22.0053 12.4899 22.0053 11.5101 21.9842 10.5244C21.9189 7.45886 21.8862 5.92609 20.7551 4.79066C19.6239 3.65523 18.0497 3.61568 14.9012 3.53657C12.9607 3.48781 11.0393 3.48781 9.09882 3.53656C5.95033 3.61566 4.37608 3.65521 3.24495 4.79065C2.11382 5.92608 2.08114 7.45885 2.01576 10.5244C1.99474 11.5101 1.99475 12.4899 2.01577 13.4756Z" stroke="hsl(var(--base))" stroke-width="1.5" stroke-linejoin="round" />
                                        </svg>
                                    </div>
                                    <div class="text-center text-sm-start">
                                        <p class="text-muted small mb-1">@lang('Envie diretamente para:')</p>
                                        <a href="mailto:remover-conta@futurus-brasil.com?subject=Solicitação de Remoção de Conta" class="email-link">
                                            remover-conta@futurus-brasil.com
                                        </a>
                                    </div>
                                </div>
                            </div>
                        @endif

                        {{-- Processing Time Info --}}
                        <div class="info-box mt-4">
                            <div class="d-flex align-items-start gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" class="flex-shrink-0 mt-1">
                                    <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" stroke="hsl(var(--success))" stroke-width="1.5"/>
                                    <path d="M8 12L11 15L16 9" stroke="hsl(var(--success))" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                <div>
                                    <h6 class="info-title">@lang('Prazo de Processamento')</h6>
                                    <p class="info-text mb-0">
                                        @lang('Sua solicitação será processada em até 30 dias úteis, conforme previsto na Lei Geral de Proteção de Dados (LGPD). Você receberá uma confirmação por e-mail quando o processo for concluído.')
                                    </p>
                                </div>
                            </div>
                        </div>

                        {{-- Back Link --}}
                        <div class="text-center mt-4">
                            <a href="{{ route('contact') }}" class="back-link">
                                @lang('Tem outras dúvidas? Entre em contato conosco')
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

@endsection

@push('style')
<style>
    .account-removal-section {
        padding: 60px 0;
    }

    .removal-icon {
        display: flex;
        justify-content: center;
    }

    .removal-card {
        background-color: hsl(var(--white));
        border-radius: 16px;
        padding: 32px;
        border: 1px solid hsl(0deg, 0%, 90%);
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);
    }

    .warning-box {
        background-color: hsl(var(--warning) / 0.1);
        border: 1px solid hsl(var(--warning) / 0.3);
        border-radius: 12px;
        padding: 20px;
    }

    .warning-title {
        color: hsl(var(--warning));
        font-weight: 600;
        margin-bottom: 8px;
    }

    .warning-text {
        color: hsl(var(--dark) / 0.8);
        font-size: 14px;
        line-height: 1.6;
    }

    .success-box {
        background-color: hsl(var(--success) / 0.05);
        border-radius: 12px;
        padding: 40px 20px;
    }

    .form-inner {
        background-color: hsl(var(--light) / 0.5);
        padding: 24px;
        border: 1px solid hsl(0deg, 0%, 94%);
        border-radius: 12px;
    }

    .form-section-title {
        font-weight: 600;
        color: hsl(var(--dark));
    }

    .form-group {
        margin-bottom: 20px;
    }

    .form--label {
        font-weight: 500;
        margin-bottom: 8px;
        display: block;
        color: hsl(var(--dark) / 0.8);
    }

    .form--control {
        border-radius: 10px;
        padding: 12px 16px;
        border: 1px solid hsl(0deg, 0%, 88%);
        transition: all 0.3s ease;
    }

    .form--control:focus {
        border-color: hsl(var(--base));
        box-shadow: 0 0 0 3px hsl(var(--base) / 0.1);
    }

    .btn-danger {
        background-color: hsl(var(--danger));
        border: none;
        padding: 14px 24px;
        border-radius: 10px;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
    }

    .btn-danger:hover {
        background-color: hsl(var(--danger) / 0.9);
        transform: translateY(-2px);
    }

    .divider {
        display: flex;
        align-items: center;
        text-align: center;
        color: hsl(var(--dark) / 0.4);
        text-transform: uppercase;
        font-size: 12px;
        letter-spacing: 1px;
    }

    .divider::before,
    .divider::after {
        content: '';
        flex: 1;
        border-bottom: 1px solid hsl(var(--dark) / 0.1);
    }

    .divider span {
        padding: 0 16px;
    }

    .email-box {
        background-color: hsl(var(--base) / 0.05);
        border: 1px solid hsl(var(--base) / 0.2);
        border-radius: 12px;
        padding: 20px;
    }

    .email-icon {
        width: 56px;
        height: 56px;
        background-color: hsl(var(--base) / 0.1);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .email-link {
        color: hsl(var(--base));
        font-weight: 600;
        font-size: 16px;
        text-decoration: none;
        word-break: break-all;
    }

    .email-link:hover {
        color: hsl(var(--base) / 0.8);
        text-decoration: underline;
    }

    .info-box {
        background-color: hsl(var(--success) / 0.05);
        border: 1px solid hsl(var(--success) / 0.2);
        border-radius: 12px;
        padding: 20px;
    }

    .info-title {
        color: hsl(var(--success));
        font-weight: 600;
        margin-bottom: 8px;
    }

    .info-text {
        color: hsl(var(--dark) / 0.7);
        font-size: 14px;
        line-height: 1.6;
    }

    .back-link {
        color: hsl(var(--base));
        font-size: 14px;
        text-decoration: none;
        transition: color 0.3s ease;
    }

    .back-link:hover {
        color: hsl(var(--base) / 0.8);
        text-decoration: underline;
    }

    /* Mobile Optimizations */
    @media (max-width: 768px) {
        .account-removal-section {
            padding: 40px 0;
        }

        .removal-card {
            padding: 20px;
            border-radius: 12px;
        }

        .removal-icon svg {
            width: 60px;
            height: 60px;
        }

        .section-title {
            font-size: 24px;
        }

        .warning-box,
        .email-box,
        .info-box {
            padding: 16px;
        }

        .form-inner {
            padding: 16px;
        }

        .form--control {
            padding: 10px 14px;
            font-size: 16px; /* Prevents zoom on iOS */
        }

        .btn-danger {
            padding: 12px 20px;
        }

        .email-link {
            font-size: 14px;
        }
    }

    @media (max-width: 576px) {
        .removal-card {
            padding: 16px;
        }

        .section-title {
            font-size: 20px;
        }

        .section-desc {
            font-size: 14px;
        }
    }
</style>
@endpush
