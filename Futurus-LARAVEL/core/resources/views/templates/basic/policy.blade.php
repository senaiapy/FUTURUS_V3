@extends('Template::layouts.frontend')
@section('content')
    <section class="py-120">
        <div class="container">
            <div class="row">
                <div class="col-md-12">
                    <div class="policy-data">
                        @php
                            echo $policy->data_values->details;
                        @endphp
                    </div>
                </div>
            </div>
        </div>
    </section>
@endsection


@push('style')
    <style>
        .policy-data {
            border: 1px solid hsl(var(--border-color)/0.2);
            padding: 36px;
            border-radius: 8px;
        }

        .policy-data h5 {
            margin-bottom: 16px
        }

        .policy-data p {
            font-size: 18px;
        }

        .policy-data ul {
            padding-left: 20px;
            margin-top: 12px;
            margin-left: 12px;
        }

        .policy-data ul li {
            list-style: disc;
            font-size: 18px;
        }

        .policy-data ul li:not(:last-child) {
            margin-bottom: 12px;
        }
    </style>
@endpush
