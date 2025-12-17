<?php

namespace App\Http\Controllers;

use App\Helper\Response;
use App\Models\Prefecture;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class PrefectureController extends Controller
{
    public function index(Request $request)
    {
        try {
            // Prepare the base query
            $query = Prefecture::with('region:id,name');

            // Filter by region_id if provided
            if ($request->has('region_id')) {
                $request->validate([
                    'region_id' => 'required|integer',
                ]);

                $query->where('region_id', $request->region_id);
            }

            // Retrieve prefectures with related region
            $prefectures = $query->select('id', 'prefecture_name', 'shipping_fee', 'region_id')
                ->get();

            return Response::success($prefectures, 'Prefectures retrieved successfully', 200);
        } catch (ValidationException $e) {
            Log::error($e->errors());
            return Response::error($e->errors(), null, 400);
        } catch (\Throwable $th) {
            Log::error($th->getMessage());
            return Response::error($th->getMessage(), null, 500);
        }
    }
}
