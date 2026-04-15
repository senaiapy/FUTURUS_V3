@extends('admin.layouts.app')
@section('panel')
    <div class="row justify-content-center">
        <div class="col-lg-8">
            <div class="card overflow-hidden">
                <div class="card-body p-0">
                    <div class="coming-soon-wrapper text-center">
                        <div class="coming-soon-bg">
                            <div class="coming-soon-content">
                                <div class="icon-wrapper mb-4">
                                    <div class="icon-circle">
                                        <i class="las la-users-cog"></i>
                                    </div>
                                </div>
                                <h2 class="title mb-3">@lang('Grupos')</h2>
                                <div class="badge-coming-soon mb-4">
                                    <span>@lang('Em Breve')</span>
                                </div>
                                <p class="description mb-4">
                                    @lang('Estamos trabalhando em algo incrivel! Em breve voce podera gerenciar grupos de usuarios, criar comunidades e muito mais.')
                                </p>
                                <div class="features-preview">
                                    <div class="row g-3">
                                        <div class="col-md-4">
                                            <div class="feature-item">
                                                <i class="las la-user-friends"></i>
                                                <span>@lang('Criar Grupos')</span>
                                            </div>
                                        </div>
                                        <div class="col-md-4">
                                            <div class="feature-item">
                                                <i class="las la-comments"></i>
                                                <span>@lang('Chat em Grupo')</span>
                                            </div>
                                        </div>
                                        <div class="col-md-4">
                                            <div class="feature-item">
                                                <i class="las la-trophy"></i>
                                                <span>@lang('Competicoes')</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="notify-section mt-5">
                                    <a href="{{ route('admin.dashboard') }}" class="btn btn--primary btn-lg">
                                        <i class="las la-arrow-left me-2"></i>@lang('Voltar ao Dashboard')
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection

@push('style')
<style>
    .coming-soon-wrapper {
        position: relative;
        min-height: 600px;
    }

    .coming-soon-bg {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 600px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        overflow: hidden;
    }

    .coming-soon-bg::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
        animation: pulse-bg 4s ease-in-out infinite;
    }

    .coming-soon-bg::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 100px;
        background: linear-gradient(to top, rgba(0,0,0,0.1), transparent);
    }

    @keyframes pulse-bg {
        0%, 100% { transform: scale(1); opacity: 0.5; }
        50% { transform: scale(1.1); opacity: 0.8; }
    }

    .coming-soon-content {
        position: relative;
        z-index: 1;
        padding: 40px 20px;
        max-width: 600px;
    }

    .icon-wrapper {
        display: flex;
        justify-content: center;
    }

    .icon-circle {
        width: 120px;
        height: 120px;
        background: rgba(255,255,255,0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(10px);
        border: 2px solid rgba(255,255,255,0.3);
        animation: float 3s ease-in-out infinite;
    }

    .icon-circle i {
        font-size: 60px;
        color: #fff;
    }

    @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
    }

    .title {
        color: #fff;
        font-size: 2.5rem;
        font-weight: 700;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }

    .badge-coming-soon {
        display: inline-block;
    }

    .badge-coming-soon span {
        background: rgba(255,255,255,0.2);
        color: #fff;
        padding: 10px 30px;
        border-radius: 50px;
        font-size: 1rem;
        font-weight: 600;
        letter-spacing: 2px;
        text-transform: uppercase;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.3);
    }

    .description {
        color: rgba(255,255,255,0.9);
        font-size: 1.1rem;
        line-height: 1.8;
    }

    .features-preview {
        margin-top: 30px;
    }

    .feature-item {
        background: rgba(255,255,255,0.15);
        padding: 20px 15px;
        border-radius: 15px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.2);
        transition: all 0.3s ease;
    }

    .feature-item:hover {
        background: rgba(255,255,255,0.25);
        transform: translateY(-5px);
    }

    .feature-item i {
        font-size: 30px;
        color: #fff;
        display: block;
        margin-bottom: 10px;
    }

    .feature-item span {
        color: #fff;
        font-size: 0.9rem;
        font-weight: 500;
    }

    .btn--primary {
        padding: 12px 30px;
        font-weight: 600;
        border-radius: 50px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        transition: all 0.3s ease;
    }

    .btn--primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0,0,0,0.3);
    }
</style>
@endpush
