<?php

namespace App\Http\Controllers;

use App\Enums\UserType;
use App\Helper\Response;
use App\Models\Address;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Psy\VersionUpdater\SelfUpdate;
use Str;

class AddressController extends Controller
{
    /**
     * Get user address (works for both web and API)
     * 
     * @param Request $request
     * @return \Illuminate\Http\Response|\Illuminate\Http\JsonResponse
     */
    public function getAddress(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return Response::error('User not authenticated', 'User not authenticated failed', 401);
        }

        $addresses = $user->addresses()->with(['region', 'prefecture'])->get();

        return Response::success([
            'addresses' => $addresses,
            'user' => $user->only(['id', 'name', 'email', 'mobile', 'user_type'])
        ], 'Addresses retrieved successfully', 200);
    }

    /**
     * Store a new address or update existing address
     * 
     * @param Request $request
     * @return \Illuminate\Http\Response|\Illuminate\Http\JsonResponse
     */
    public function storeShippingData(Request $request)
    {
        try {
            // Step 1: Validate incoming user data
            $request->validate([
                'region_id' => 'required|exists:regions,id',
                'prefecture_id' => 'required|exists:prefectures,id',
                'city' => 'required|string|max:60',
                'postal_code' => 'required|string|max:10',
                'address_line_1' => 'required|string',
                'address_line_2' => 'nullable|string',
            ]);

            //add shipping data to the user
            $user = $request->user();


            //check database transaction
            DB::beginTransaction();

            $address = Address::create([
                'user_id' => $user->id,
                'region_id' => $request->region_id,
                'prefecture_id' => $request->prefecture_id,
                'city' => $request->city,
                'postal_code' => $request->postal_code,
                'address_line_1' => $request->address_line_1,
                'address_line_2' => $request->address_line_2,
            ]);

            //commit the transaction
            DB::commit();
            return Response::success($address, 'Address created successfully', 200);

        } catch (\Illuminate\Validation\ValidationException $validationException) {
            Log::error('Validation failed for address data: ', $validationException->errors());
            return Response::error('Validation failed for address data.', $validationException->errors(), 422);
        } catch (Exception $e) {
            // Rollback the transaction if an error occurs
            DB::rollBack();
            Log::error(
                'Error occurred while updating user: ',
                [
                    'error' => $e->getMessage(),
                    'line' => $e->getLine(),
                    'file' => $e->getFile(),
                ]
            );
            return Response::error('An error occurred while updating the user.', 500);
        }

    }
    /**
     * Update an existing address
     * 
     * @param Request $request
     * @return \Illuminate\Http\Response|\Illuminate\Http\JsonResponse
     */

    public function updateShippingData(Request $request)
    {
        try {
            // Step 1: Validate incoming user data
            $request->validate([
                'region_id' => 'required|exists:regions,id',
                'prefecture_id' => 'required|exists:prefectures,id',
                'city' => 'required|string|max:60',
                'postal_code' => 'required|string|max:10',
                'address_line_1' => 'required|string',
                'address_line_2' => 'nullable|string',
            ]);

            //add shipping data to the user
            $user = $request->user();

            //check database transaction
            DB::beginTransaction();

            // Ensure we have an address ID to update
            if(!$request->has('address_id')) {
                return Response::error('Address ID is required', 'Address ID is missing', 422);
            }

            // Find the address to ensure it belongs to the user
            $address = Address::where('id', $request->address_id)
                         ->where('user_id', $user->id)
                         ->first();
            
            if(!$address) {
                return Response::error('Address not found', 'Address not found or does not belong to user', 404);
            }

            // Update the address
            $address->update([
                'region_id' => $request->region_id,
                'prefecture_id' => $request->prefecture_id,
                'city' => $request->city,
                'postal_code' => $request->postal_code,
                'address_line_1' => $request->address_line_1,
                'address_line_2' => $request->address_line_2,
            ]);

            // Load relationships for the response
            $address->load(['region', 'prefecture']);

            // Commit the transaction
            DB::commit();
            return Response::success($address, 'Address updated successfully', 200);

        } catch (\Illuminate\Validation\ValidationException $validationException) {
            Log::error('Validation failed for address data: ', $validationException->errors());
            return Response::error('Validation failed for address data.', $validationException->errors(), 422);
        } catch (Exception $e) {
            // Rollback the transaction if an error occurs
            DB::rollBack();
            Log::error(
                'Error occurred while updating user: ',
                [
                    'error' => $e->getMessage(),
                    'line' => $e->getLine(),
                    'file' => $e->getFile(),
                ]
            );
            return Response::error('An error occurred while updating the user.', 500);

        }
    }

    /**
     * Delete an address
     * 
     * @param Request $request
     * @param int $addressId
     * @return \Illuminate\Http\Response|\Illuminate\Http\JsonResponse
     */
    public function deleteAddress(Request $request, $addressId)
    {
        $user = $request->user();

        if (!$user) {
            return Response::error('User not authenticated', 'User not authenticated failed', 401);
        }

        $address = Address::where('id', $addressId)->where('user_id', $user->id)->first();

        if (!$address) {
            return Response::error('Address not found or not authorized', 'Address not found or not authorized failed', 404);
        }

        $address->delete();

        return Response::success(null, 'Address deleted successfully', 200);
    }
}
