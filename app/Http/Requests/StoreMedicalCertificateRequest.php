<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMedicalCertificateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('upload', $this->route('member')) ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'file' => [
                'required',
                'file',
                'max:10240',
                'mimes:pdf,jpg,jpeg,png',
            ],
        ];
    }
}
