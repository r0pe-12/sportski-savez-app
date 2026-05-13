<?php

return [
    'adapter' => env('OCR_ADAPTER', 'fake'),
    'manual_review_threshold' => 0.6,
    'languages' => ['sr', 'bs', 'hr'],
];
