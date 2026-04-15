@extends('Template::layouts.master')
@section('content')
<div class="dashboard-inner">
    <div class="row justify-content-center">
        <div class="col-md-6">
            <div class="card custom--card">
                <div class="card-header card-header-bg">
                    <h5 class="text-center"> <i class="las la-wallet"></i> @lang('Pagamento via PIX')</h5>
                </div>
                <div class="card-body text-center">
                    <p class="mb-3">@lang('Escaneie o QR Code abaixo ou copie a chave PIX para finalizar o seu depósito.')</p>
                    
                    <div class="pix-qr-code mb-4">
                        <img src="data:image/png;base64,{{ $data->encodedImage }}" alt="@lang('QR Code PIX')" class="img-fluid" style="max-width: 250px;">
                    </div>

                    <div class="form-group mb-4">
                        <label class="form-label font-weight-bold">@lang('Código PIX (Copia e Cola)')</label>
                        <div class="input-group">
                            <input type="text" id="pix-payload" class="form-control" value="{{ $data->payload }}" readonly>
                            <button class="btn btn--base" type="button" onclick="copyPixCode()">
                                <i class="las la-copy"></i> @lang('Copiar')
                            </button>
                        </div>
                    </div>

                    <div class="alert alert--info">
                        <p class="mb-0">
                            <i class="las la-info-circle"></i> 
                            @lang('Após realizar o pagamento, o seu saldo será atualizado automaticamente em alguns instantes.')
                        </p>
                    </div>

                    <div class="mt-4">
                        <a href="{{ route('user.deposit.history') }}" class="btn btn-outline--base w-100">
                            @lang('Voltar para Histórico')
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
    function copyPixCode() {
        var copyText = document.getElementById("pix-payload");
        copyText.select();
        copyText.setSelectionRange(0, 99999);
        navigator.clipboard.writeText(copyText.value);
        
        notify('success', 'Código PIX copiado com sucesso!');
    }
</script>

<style>
    .pix-qr-code {
        background: #fff;
        padding: 20px;
        display: inline-block;
        border-radius: 10px;
        box-shadow: 0 0 15px rgba(0,0,0,0.1);
    }
</style>
@endsection
