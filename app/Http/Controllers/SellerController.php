<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Helper\Response;
use App\Models\Seller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class SellerController extends Controller
{
    /**
     * Register a new seller
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function register(Request $request)
    {
        try {
            // Validate request
            $fields = $request->validate([
                'shop_name' => 'required|string|unique:sellers,shop_name',
                'shop_description' => 'nullable|string',
                'shop_address' => 'nullable|string',
                'shop_phone' => 'nullable|string|unique:sellers,shop_phone',
                'shop_email' => 'nullable|email|unique:sellers,shop_email',
                'shop_url' => 'nullable|string|unique:sellers,shop_url',
                'bank_name' => 'nullable|string',
                'bank_account_number' => 'nullable|string',
                'bank_account_name' => 'nullable|string',
                'tax_id' => 'nullable|string',
                'shop_logo' => 'nullable|image|max:2048',
                'shop_banner' => 'nullable|image|max:4096',
                'shop_logo' => 'nullable|image|max:2048',
                'shop_banner' => 'nullable|image|max:4096',
            ]);
        } catch (ValidationException $e) {
            Log::error($e->getMessage());
            return Response::error($e->getMessage(), null, 422);
        }

        try {
            DB::beginTransaction();

            $user = $request->user();

            if (!$user) {
                return Response::error('User not authenticated', null, 401);
            }
            

            // Check if user is already a seller
            if (Seller::where('user_id', $user->id)->exists()) {
                return Response::error('User is already a seller', null, 400);
            }

            $logoPath = null;
            if ($request->hasFile('shop_logo')) {
                $file = $request->file('shop_logo');
                $filename = time() . '_' . $file->getClientOriginalName();
                $path = $file->storeAs('sellers/logos', $filename, 'public');
                $logoPath = 'storage/' . $path;
            }

            $bannerPath = null;
            if ($request->hasFile('shop_banner')) {
                $file = $request->file('shop_banner');
                $filename = time() . '_' . $file->getClientOriginalName();
                $path = $file->storeAs('sellers/banners', $filename, 'public');
                $bannerPath = 'storage/' . $path;
            }

            // Create seller
            $seller = Seller::create([
                'user_id' => $user->id,
                'shop_name' => $fields['shop_name'],
                'shop_description' => $fields['shop_description'] ?? null,
                'shop_address' => $fields['shop_address'] ?? null,
                'shop_phone' => $fields['shop_phone'] ?? null,
                'shop_email' => $fields['shop_email'] ?? null,
                'shop_url' => $fields['shop_url'] ?? null,
                'bank_name' => $fields['bank_name'] ?? null,
                'bank_account_number' => $fields['bank_account_number'] ?? null,
                'bank_account_name' => $fields['bank_account_name'] ?? null,
                'tax_id' => $fields['tax_id'] ?? null,
                'shop_logo' => $logoPath,
                'shop_banner' => $bannerPath,
                'status' => 0, // Pending
            ]);

            DB::commit();

            return Response::success(
                $seller,
                'Seller registered successfully',
                201
            );

        } catch (\Throwable $th) {
            DB::rollBack();
            Log::error($th->getMessage());
            return Response::error(
                $th->getMessage(),
                null,
                500
            );
        }
    }

    /**
     * Get seller details for the authenticated user
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getSellerDetails(Request $request)
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return Response::error('User not authenticated', null, 401);
            }

            $seller = Seller::where('user_id', $user->id)->first();

            if (!$seller) {
                return Response::error('Seller profile not found', null, 404);
            }

            return Response::success(
                $seller,
                'Seller details retrieved successfully',
                200
            );

        } catch (\Throwable $th) {
            Log::error($th->getMessage());
            return Response::error(
                $th->getMessage(),
                null,
                500
            );
        }
    }
}
