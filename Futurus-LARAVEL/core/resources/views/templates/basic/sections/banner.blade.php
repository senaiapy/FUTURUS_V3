@php
    $bannerElement = getContent('banner.element', orderById: true);
@endphp
<section class="banner-section" style="padding: 180px 0 100px; min-height: 100vh; display: flex; align-items: center; position: relative;">
    <!-- Abstract glowing elements -->
    <div style="position: absolute; top: -10%; left: -10%; width: 50%; height: 50%; background: radial-gradient(circle, rgba(0,212,255,0.05) 0%, transparent 70%); border-radius: 50%; pointer-events: none;"></div>
    <div style="position: absolute; bottom: -10%; right: -10%; width: 60%; height: 60%; background: radial-gradient(circle, rgba(201,168,106,0.05) 0%, transparent 70%); border-radius: 50%; pointer-events: none;"></div>

    <div class="container" style="position: relative; z-index: 2;">
        @foreach ($bannerElement as $banner)
            <div class="row align-items-center">
                <div class="col-lg-7 col-md-12 text-lg-start text-center mb-5 mb-lg-0">
                    <span style="display: inline-block; padding: 6px 16px; background: rgba(201,168,106,0.1); border: 1px solid rgba(201,168,106,0.3); color: #C9A86A; border-radius: 50px; font-weight: 500; font-size: 14px; margin-bottom: 24px; letter-spacing: 1px; text-transform: uppercase;">
                        O Futuro dos Mercados
                    </span>
                    <h1 style="font-size: clamp(42px, 5vw, 64px); line-height: 1.1; font-weight: 700; color: #FFFFFF; margin-bottom: 30px; letter-spacing: -1.5px;">
                        {{ __($banner?->data_values?->heading ?? 'Invista no Amanhã') }}
                    </h1>
                    <p style="font-size: 18px; color: #9CA3AF; line-height: 1.6; max-width: 600px; margin: 0 auto 40px auto; font-family: 'Inter', sans-serif; font-weight: 300;">
                        {{ __($banner?->data_values?->subheading ?? 'Atuamos no mercado financeiro provendo as melhores plataformas preditivas para você multiplicar seu capital de forma transparente e segura.') }}
                    </p>
                    <div class="d-flex flex-wrap gap-3 justify-content-lg-start justify-content-center">
                        <a href="{{ url($banner?->data_values?->button_link ?? '/user/register') }}" class="btn--base" style="padding: 16px 36px; font-size: 16px;">
                            {{ __($banner?->data_values?->button_name ?? 'Abra sua conta') }}
                        </a>
                        <a href="#about" class="btn-outline--base" style="padding: 16px 36px; font-size: 16px; text-decoration: none;">
                            Saiba mais 
                        </a>
                    </div>
                </div>
                <div class="col-lg-5 col-md-12 text-center">
                    <div style="position: relative;">
                        <!-- Glassmorphism Card Element to mimic high-end investment dashboard -->
                        <div style="background: rgba(10, 18, 45, 0.5); border: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(16px); border-radius: 20px; padding: 40px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); transform: perspective(1000px) rotateY(-10deg) rotateX(5deg);">
                            <img src="{{ frontendImage('banner', $banner?->data_values?->image_one ?? '', '650x770') }}" alt="Plataforma de Investimentos" style="width: 100%; height: auto; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);" onerror="this.src='https://lftm.com.br/wp-content/uploads/2024/09/Home-OQ-FAZEMOS.webp'">
                        </div>
                        
                        <!-- Floating Badge -->
                        <div style="position: absolute; bottom: -20px; left: -20px; background: rgba(6, 12, 34, 0.7); border: 1px solid #C9A86A; border-radius: 12px; padding: 16px 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.4); display: flex; align-items: center; gap: 12px; backdrop-filter: blur(10px);">
                            <div style="width: 40px; height: 40px; background: rgba(201,168,106,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #C9A86A;">
                                <i class="las la-chart-bar" style="font-size: 24px;"></i>
                            </div>
                            <div class="text-start">
                                <h6 style="margin: 0; color: #FFFFFF; font-size: 14px;">+ 14 Anos</h6>
                                <p style="margin: 0; color: #9CA3AF; font-size: 12px;">Gerando Valor</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        @endforeach
    </div>
</section>
