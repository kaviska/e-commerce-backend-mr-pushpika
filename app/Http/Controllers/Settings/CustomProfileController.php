<?php


namespace App\Http\Controllers\Settings;

use App\Helper\Response;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CustomProfileController
{
    /**
     * Update user profile information
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request)
    {
        try {
            //validate the request
            $request->validate([
                'name' => 'required|string|max:255',
                'mobile' => [
                    'required',
                    'string',
                    'max:15',
                    'regex:/^(\+94|0)?\d{9}$|^(\+81|0)?\d{10}$/', // Regex for Sri Lanka and Japan mobile numbers
                ],
            ]);

            //find the user
            $user = $request->user();

            //check database transaction
            DB::beginTransaction();

            //update the user
            $user->name = $request->name;
            $user->mobile = $request->mobile;
            $user->save();

            //commit the transaction
            DB::commit();
            return Response::success($user, 'User updated successfully', 200);
        } catch (\Illuminate\Validation\ValidationException $validationException) {
            Log::error('Validation failed for user data: ', $validationException->errors());
            return Response::error('Validation failed', $validationException->errors(), 422);
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
     * Delete user account permanently
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteAccountPermanently(Request $request)
    {
        try {
            // Step 1: Get the authenticated user
            $user = $request->user();

            // Step 2: Check if the user is authenticated
            if (!$user) {
                return Response::error('User not authenticated', 'User not authenticated failed', 401);
            }

            // Step 3: Delete the user account and associated data
            DB::beginTransaction();

            // Delete the user account
            // Delete user's tokens (assuming Laravel Sanctum/Passport usage)
            $user->tokens()->delete();

            // Finally delete the user account itself
            $user->delete();
            
            DB::commit();
            return Response::success(null, 'Account deleted successfully', 200);

        } catch (Exception $e) {
            DB::rollBack();
            Log::error(
                'Error occurred while deleting account: ',
                [
                    'error' => $e->getMessage(),
                    'line' => $e->getLine(),
                    'file' => $e->getFile(),
                ]
            );
            return Response::error('An error occurred while deleting the account.',null, 500);
        }
    }
}

