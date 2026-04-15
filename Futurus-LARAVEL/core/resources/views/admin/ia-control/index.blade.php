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
                                        <i class="las la-robot"></i>
                                    </div>
                                    <div class="neural-network">
                                        <span class="node node-1"></span>
                                        <span class="node node-2"></span>
                                        <span class="node node-3"></span>
                                        <span class="node node-4"></span>
                                        <span class="node node-5"></span>
                                        <span class="node node-6"></span>
                                    </div>
                                </div>
                                <h2 class="title mb-3">@lang('IA Control')</h2>
                                <div class="badge-coming-soon mb-4">
                                    <span>@lang('Em Breve')</span>
                                </div>
                                <p class="description mb-4">
                                    @lang('O futuro da inteligencia artificial esta chegando! Em breve voce tera controle total sobre modelos de IA, automacoes inteligentes e muito mais.')
                                </p>
                                <div class="features-preview">
                                    <div class="row g-3">
                                        <div class="col-md-4">
                                            <div class="feature-item">
                                                <i class="las la-brain"></i>
                                                <span>@lang('Modelos IA')</span>
                                            </div>
                                        </div>
                                        <div class="col-md-4">
                                            <div class="feature-item">
                                                <i class="las la-cogs"></i>
                                                <span>@lang('Automacao')</span>
                                            </div>
                                        </div>
                                        <div class="col-md-4">
                                            <div class="feature-item">
                                                <i class="las la-chart-bar"></i>
                                                <span>@lang('Analytics')</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="ai-stats mt-4">
                                    <div class="row g-3">
                                        <div class="col-4">
                                            <div class="stat-item">
                                                <span class="stat-value typing-effect">---</span>
                                                <span class="stat-label">@lang('Modelos')</span>
                                            </div>
                                        </div>
                                        <div class="col-4">
                                            <div class="stat-item">
                                                <span class="stat-value typing-effect">---</span>
                                                <span class="stat-label">@lang('Automacoes')</span>
                                            </div>
                                        </div>
                                        <div class="col-4">
                                            <div class="stat-item">
                                                <span class="stat-value typing-effect">---</span>
                                                <span class="stat-label">@lang('Requisicoes')</span>
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
        background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
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
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background:
            radial-gradient(circle at 20% 80%, rgba(0, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(138, 43, 226, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(0, 255, 136, 0.05) 0%, transparent 40%);
        animation: pulse-bg 6s ease-in-out infinite;
    }

    .coming-soon-bg::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300ffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        opacity: 0.5;
    }

    @keyframes pulse-bg {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
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
        background: linear-gradient(135deg, #00ffff 0%, #00ff88 50%, #8a2be2 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow:
            0 0 30px rgba(0, 255, 255, 0.5),
            0 0 60px rgba(0, 255, 255, 0.3),
            inset 0 0 30px rgba(255, 255, 255, 0.1);
        border: 2px solid rgba(0, 255, 255, 0.5);
        animation: float 3s ease-in-out infinite, glow-pulse 2s ease-in-out infinite alternate;
    }

    .icon-circle i {
        font-size: 60px;
        color: #0f0c29;
        text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
    }

    @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
    }

    @keyframes glow-pulse {
        0% {
            box-shadow:
                0 0 30px rgba(0, 255, 255, 0.5),
                0 0 60px rgba(0, 255, 255, 0.3);
        }
        100% {
            box-shadow:
                0 0 50px rgba(0, 255, 255, 0.8),
                0 0 100px rgba(0, 255, 255, 0.5),
                0 0 150px rgba(138, 43, 226, 0.3);
        }
    }

    .neural-network {
        position: absolute;
        width: 250px;
        height: 250px;
        pointer-events: none;
    }

    .node {
        position: absolute;
        width: 8px;
        height: 8px;
        background: #00ffff;
        border-radius: 50%;
        box-shadow: 0 0 10px #00ffff;
        animation: node-pulse 2s ease-in-out infinite;
    }

    .node-1 { top: 20px; left: 50px; animation-delay: 0s; }
    .node-2 { top: 40px; right: 40px; animation-delay: 0.3s; }
    .node-3 { top: 100px; left: 20px; animation-delay: 0.6s; }
    .node-4 { bottom: 40px; right: 30px; animation-delay: 0.9s; }
    .node-5 { bottom: 20px; left: 60px; animation-delay: 1.2s; }
    .node-6 { top: 60px; left: 100px; animation-delay: 1.5s; }

    @keyframes node-pulse {
        0%, 100% { opacity: 0.3; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.5); }
    }

    .title {
        color: #fff;
        font-size: 2.5rem;
        font-weight: 700;
        text-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
    }

    .badge-coming-soon {
        display: inline-block;
    }

    .badge-coming-soon span {
        background: linear-gradient(135deg, #00ffff 0%, #00ff88 100%);
        color: #0f0c29;
        padding: 10px 30px;
        border-radius: 50px;
        font-size: 1rem;
        font-weight: 700;
        letter-spacing: 2px;
        text-transform: uppercase;
        box-shadow: 0 0 20px rgba(0, 255, 255, 0.4);
    }

    .description {
        color: rgba(255, 255, 255, 0.9);
        font-size: 1.1rem;
        line-height: 1.8;
    }

    .features-preview {
        margin-top: 30px;
    }

    .feature-item {
        background: rgba(0, 255, 255, 0.1);
        padding: 20px 15px;
        border-radius: 15px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(0, 255, 255, 0.2);
        transition: all 0.3s ease;
    }

    .feature-item:hover {
        background: rgba(0, 255, 255, 0.2);
        transform: translateY(-5px);
        box-shadow: 0 10px 30px rgba(0, 255, 255, 0.2);
    }

    .feature-item i {
        font-size: 30px;
        color: #00ffff;
        display: block;
        margin-bottom: 10px;
    }

    .feature-item span {
        color: #fff;
        font-size: 0.9rem;
        font-weight: 500;
    }

    .ai-stats {
        background: rgba(0, 0, 0, 0.3);
        padding: 20px;
        border-radius: 15px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(0, 255, 255, 0.1);
    }

    .stat-item {
        text-align: center;
    }

    .stat-value {
        display: block;
        font-size: 1.5rem;
        font-weight: 700;
        color: #00ffff;
        font-family: 'Courier New', monospace;
    }

    .stat-label {
        display: block;
        font-size: 0.8rem;
        color: rgba(255, 255, 255, 0.7);
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .btn--primary {
        background: linear-gradient(135deg, #00ffff 0%, #00ff88 100%);
        color: #0f0c29;
        padding: 12px 30px;
        font-weight: 600;
        border-radius: 50px;
        border: none;
        box-shadow: 0 4px 20px rgba(0, 255, 255, 0.3);
        transition: all 0.3s ease;
    }

    .btn--primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 30px rgba(0, 255, 255, 0.5);
        color: #0f0c29;
    }
</style>
@endpush
