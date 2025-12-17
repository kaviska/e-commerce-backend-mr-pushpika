<?php

namespace App\Http\Controllers;

use App\Helper\Response;
use App\Models\PostalCode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class PostalCodeController extends Controller
{
    public function index(Request $request)
    {
        try {
            // Validate request inputs
            $validated = $request->validate([
                'postal_code' => 'nullable|string|max:10',
                'prefecture_name' => 'nullable|string|max:100',
                'city' => 'nullable|string|max:100',
                'page' => 'nullable|integer|min:1',
                'limit' => 'nullable|integer|min:1|max:100', // Max limit 100 for performance
            ]);

            // Set pagination variables
            $limit = $validated['limit'] ?? 50;
            $page = $validated['page'] ?? 1;

            // Generate a unique cache key based on query parameters
            $cacheKey = "postal_codes:page_{$page}:limit_{$limit}:" .
                md5(json_encode($validated));

            // Use caching to improve performance
            $postalCodes = Cache::remember($cacheKey, 3600, function () use ($validated, $limit, $page) {
                $query = PostalCode::query()->select('id', 'postal_code', 'prefecture_name_en', 'city_name_en');

                // Apply filters with case-insensitive search
                if (!empty($validated['postal_code'])) {
                    $query->where('postal_code', 'LIKE',  $validated['postal_code'] . "%");
                }

                if (!empty($validated['prefecture_name'])) {
                    $query->whereRaw('UPPER(prefecture_name_en) LIKE UPPER(?)', ["%" . strtoupper($validated['prefecture_name']) . "%"]);
                }

                if (!empty($validated['city'])) {
                    $query->whereRaw('UPPER(city_name_en) LIKE UPPER(?)', ["%" . strtoupper($validated['city']) . "%"]);
                }

                // Apply pagination with both page & limit
                return $query->paginate($limit, ['*'], 'page', $page);
            });

            return Response::success($postalCodes, 'Postal data retrieved successfully', 200);
        } catch (\Throwable $th) {
            Log::error('PostalCodeController@index Error: ' . $th->getMessage());
            return Response::error('An unexpected error occurred. Please try again.', null, 500);
        }
    }
      
    public function showAllPostalCodesBy(Request $request)
    {
        try {
            // Validate request input
            $validated = $request->validate([
                'prefecture_name' => 'required|string|max:100',
            ]);
    
            // Retrieve postal codes based on prefecture_name
            $postalCodes = PostalCode::query()
                ->select('id', 'postal_code', 'prefecture_name_en', 'city_name_en')
                ->whereRaw('UPPER(prefecture_name_en) LIKE UPPER(?)', ["%" . strtoupper($validated['prefecture_name']) . "%"])
                ->get();
    
            return Response::success($postalCodes, 'Postal codes retrieved successfully', 200);
        } catch (\Throwable $th) {
            Log::error('PostalCodeController@getPostalCodesByPrefecture Error: ' . $th->getMessage());
            return Response::error('An unexpected error occurred. Please try again.', null, 500);
        }
    }
}
