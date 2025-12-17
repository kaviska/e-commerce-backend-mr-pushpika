<?php

namespace App\Services;

use App\Enums\UserType;
use App\Helper\Response;
use App\Models\User;
use App\Models\Address;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;

class AddressService
{
    /**
     * Store or update a user's address.
     *
     * @param array $userData
     * @return array Response data containing address and user details
     */
    public function storeOrUpdate(array $userData)
    {
        try {
            // Step 1: Prepare validation rules
            $validationRules = [
                'region_id' => 'required|exists:regions,id',
                'prefecture_id' => 'required|exists:prefectures,id',
                'city' => 'required|string|max:60',
                'postal_code' => 'required|string|max:10',
                'address_line_1' => 'required|string',
                'address_line_2' => 'nullable|string',
                'address_id' => 'nullable|exists:addresses,id',
                'device_name' => 'nullable|string|max:255',

                // Guest user details (only needed for guest users)
                'name' => 'required_without:user_id|string|max:255',
                'mobile' => [
                    'required_without:user_id',
                    'string',
                    'max:15',
                    'regex:/^(\+94|0)?\d{9}$|^(\+81|0)?\d{10}$/', // Regex for Sri Lanka and Japan mobile numbers
                ],
            ];

            // Only apply email uniqueness validation when not a guest user with existing email
            $emailRules = ['required_without:user_id', 'email'];

            // Check if this is a guest user request (no user_id)
            if (!isset($userData['user_id'])) {
                // Check if a guest user already exists with this email
                $existingUser = User::where('email', $userData['email'])
                    ->where('user_type', UserType::GUEST)
                    ->first();

                // If no existing guest user with this email, then apply uniqueness rule
                if (!$existingUser) {
                    $emailRules[] = Rule::unique('users');
                }
            } else {
                // For logged-in users, maintain the normal uniqueness check with ignore
                $emailRules[] = Rule::unique('users')->ignore($userData['user_id']);
            }

            $validationRules['email'] = $emailRules;

            // Validate with the constructed rules
            $validator = Validator::make($userData, $validationRules);

            // Return validation errors if any
            if ($validator->fails()) {
                Log::error(
                    'Validation failed for address data: ',
                    $validator->errors()->toArray()
                );
                return ['errors' => $validator->errors()];
            }

            // Step 2: Wrap the address creation/update process in a transaction
            return DB::transaction(function () use ($userData) {
                // Step 3: Determine the user (use provided user_id or find/create a guest user)
                $updateData = [
                    'name' => $userData['name'],
                    'mobile' => $userData['mobile'],
                ];

                if (!isset($userData['user_id'])) {
                    // Check if a guest user already exists with this email
                    $user = User::where('email', $userData['email'])
                        ->where('user_type', UserType::GUEST)
                        ->first();

                    // If no existing guest user, prepare data for creation
                    if (!$user) {
                        $updateData['user_type'] = UserType::GUEST;
                        $updateData['password'] = Hash::make(\Illuminate\Support\Str::random(12));
                        $user = User::create([
                            'email' => $userData['email'],
                            ...$updateData
                        ]);
                    } else {
                        // Update existing guest user
                        $user->update($updateData);
                    }
                } else {
                    // For logged-in users, use the standard updateOrCreate
                    $user = User::find($userData['user_id']);
                    if ($user) {
                        $user->update($updateData);
                    } else {
                        return ['error' => 'User not found'];
                    }
                }

                // Step 4: Prepare address data
                $addressData = [
                    'region_id' => $userData['region_id'],
                    'prefecture_id' => $userData['prefecture_id'],
                    'city' => $userData['city'],
                    'postal_code' => $userData['postal_code'],
                    'address_line_1' => $userData['address_line_1'],
                    'address_line_2' => $userData['address_line_2'],
                    'country' => $userData['country'] ?? 'Japan', // Default country is Japan
                ];

                // Step 5: Update existing address or create a new one
                if (isset($userData['address_id']) && $userData['address_id'] != null) {
                    // Find the address belonging to the user
                    $address = Address::where('id', $userData['address_id'])
                        ->where('user_id', $user->id)
                        ->first();

                    // If the address is found and belongs to the user, update it
                    if ($address) {
                        $address->update($addressData);
                    } else {
                        Log::error('Address not found or not authorized for user: ' . $user->id);
                        return ['error' => 'Address not found or not authorized'];
                    }
                } else {
                    // Create a new address associated with the user
                    $address = $user->addresses()->create($addressData);
                }

                // Step 6: Load relationships (eager loading for optimized queries)
                $address->load(['region', 'prefecture']);

                // Create token for guest user
                if ($user->user_type == UserType::GUEST) {
                    $token = $user->createToken($userData['device_name'] ?? 'Guest Device')->plainTextToken;
                    $user->token = $token;
                }

                // Step 7: Return the response data containing the address and user information
                return [
                    'address' => $address,
                    'user' => $user->only(['id', 'name', 'email', 'mobile', 'user_type', 'token']),
                ];
            });
        } catch (\Exception $e) {
            // Log the exception details
            Log::error('Error in AddressService storeOrUpdate method: ' . $e->getMessage(), [
                'userData' => $userData,
                'exception' => $e,
            ]);
            // Return a general error response
            return [
                'error' => 'An error occurred while processing your request.' . $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
                'trace' => $e->getTraceAsString(),
                // Optional: Include the stack trace for debugging
            ];
        }
    }
}
