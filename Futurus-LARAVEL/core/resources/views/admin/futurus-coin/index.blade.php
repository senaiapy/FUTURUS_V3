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
                                        <i class="las la-coins"></i>
                                    </div>
                                    <div class="floating-coins">
                                        <span class="coin coin-1"><i class="las la-bitcoin"></i></span>
                                        <span class="coin coin-2"><i class="las la-dollar-sign"></i></span>
                                        <span class="coin coin-3"><i class="las la-gem"></i></span>
                                    </div>
                                </div>
                                <h2 class="title mb-3">@lang('Futurus Coin')</h2>
                                <div class="badge-coming-soon mb-4">
                                    <span>@lang('Em Breve')</span>
                                </div>
                                <p class="description mb-4">
                                    @lang('A moeda do futuro esta chegando! Prepare-se para uma nova era de transacoes, recompensas e muito mais com a Futurus Coin.')
                                </p>
                                <div class="features-preview">
                                    <div class="row g-3">
                                        <div class="col-md-4">
                                            <div class="feature-item">
                                                <i class="las la-exchange-alt"></i>
                                                <span>@lang('Transacoes')</span>
                                            </div>
                                        </div>
                                        <div class="col-md-4">
                                            <div class="feature-item">
                                                <i class="las la-gift"></i>
                                                <span>@lang('Recompensas')</span>
                                            </div>
                                        </div>
                                        <div class="col-md-4">
                                            <div class="feature-item">
                                                <i class="las la-chart-line"></i>
                                                <span>@lang('Staking')</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="stats-preview mt-4">
                                    <div class="row g-3">
                                        <div class="col-4">
                                            <div class="stat-item">
                                                <span class="stat-value">0.00</span>
                                                <span class="stat-label">@lang('Preco')</span>
                                            </div>
                                        </div>
                                        <div class="col-4">
                                            <div class="stat-item">
                                                <span class="stat-value">---</span>
                                                <span class="stat-label">@lang('Supply')</span>
                                            </div>
                                        </div>
                                        <div class="col-4">
                                            <div class="stat-item">
                                                <span class="stat-value">---</span>
                                                <span class="stat-label">@lang('Holders')</span>
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
        min-height: 650px;
    }

    .coming-soon-bg {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #4facfe 100%);
        min-height: 650px;
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
        background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 60%);
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
        position: relative;
    }

    .icon-circle {
        width: 120px;
        height: 120px;
        background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 10px 40px rgba(255, 215, 0, 0.4);
        border: 3px solid rgba(255,255,255,0.5);
        animation: float 3s ease-in-out infinite, glow 2s ease-in-out infinite alternate;
    }

    .icon-circle i {
        font-size: 60px;
        color: #fff;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }

    @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
    }

    @keyframes glow {
        0% { box-shadow: 0 10px 40px rgba(255, 215, 0, 0.4); }
        100% { box-shadow: 0 10px 60px rgba(255, 215, 0, 0.7); }
    }

    .floating-coins {
        position: absolute;
        width: 100%;
        height: 100%;
        pointer-events: none;
    }

    .coin {
        position: absolute;
        font-size: 24px;
        color: rgba(255, 215, 0, 0.8);
        animation: float-coin 4s ease-in-out infinite;
    }

    .coin-1 { top: -20px; left: -40px; animation-delay: 0s; }
    .coin-2 { top: 40px; right: -50px; animation-delay: 1s; }
    .coin-3 { bottom: -10px; left: -30px; animation-delay: 2s; }

    @keyframes float-coin {
        0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.8; }
        50% { transform: translateY(-15px) rotate(180deg); opacity: 1; }
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
        background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
        color: #333;
        padding: 10px 30px;
        border-radius: 50px;
        font-size: 1rem;
        font-weight: 700;
        letter-spacing: 2px;
        text-transform: uppercase;
        box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
    }

    .description {
        color: rgba(255,255,255,0.95);
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
        color: #ffd700;
        display: block;
        margin-bottom: 10px;
    }

    .feature-item span {
        color: #fff;
        font-size: 0.9rem;
        font-weight: 500;
    }

    .stats-preview {
        background: rgba(0,0,0,0.2);
        padding: 20px;
        border-radius: 15px;
        backdrop-filter: blur(10px);
    }

    .stat-item {
        text-align: center;
    }

    .stat-value {
        display: block;
        font-size: 1.5rem;
        font-weight: 700;
        color: #ffd700;
    }

    .stat-label {
        display: block;
        font-size: 0.8rem;
        color: rgba(255,255,255,0.7);
        text-transform: uppercase;
        letter-spacing: 1px;
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
