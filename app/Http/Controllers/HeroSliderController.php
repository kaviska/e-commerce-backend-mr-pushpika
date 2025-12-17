<?php

namespace App\Http\Controllers;

use App\Helper\Response;
use App\Models\HeroSlider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class HeroSliderController extends Controller
{
    /**
     * Display a listing of hero sliders.
     */
    public function index()
    {
        try {
            $sliders = HeroSlider::orderBy('created_at', 'desc')->get();
            
            return Response::success($sliders, 'Hero sliders retrieved successfully');
        } catch (\Exception $e) {
            return Response::error($e->getMessage(), 'Failed to retrieve hero sliders', 500);
        }
    }

    /**
     * Store a newly created hero slider.
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
                'heading' => 'nullable|string|max:255',
                'sub_heading' => 'nullable|string|max:255',
            ]);

            if ($validator->fails()) {
                return Response::error($validator->errors(), 'Validation failed', 422);
            }

            $imagePath = null;
            if ($request->hasFile('image')) {
                $image = $request->file('image');
                $imageName = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
                $imagePath = $image->storeAs('hero-sliders', $imageName, 'public');
            }

            $slider = HeroSlider::create([
                'image' => $imagePath,
                'heading' => $request->heading,
                'sub_heading' => $request->sub_heading,
            ]);

            return Response::success($slider, 'Hero slider created successfully', 201);
        } catch (\Exception $e) {
            return Response::error($e->getMessage(), 'Failed to create hero slider', 500);
        }
    }

    /**
     * Remove the specified hero slider.
     */
    public function destroy($id)
    {
        try {
            $slider = HeroSlider::find($id);

            if (!$slider) {
                return Response::error(null, 'Hero slider not found', 404);
            }

            // Delete image from storage
            if ($slider->image && Storage::disk('public')->exists($slider->image)) {
                Storage::disk('public')->delete($slider->image);
            }

            $slider->delete();

            return Response::success(null, 'Hero slider deleted successfully');
        } catch (\Exception $e) {
            return Response::error($e->getMessage(), 'Failed to delete hero slider', 500);
        }
    }

    /**
     * Update the specified hero slider.
     */
    public function update(Request $request)
    {
        try {
            $id = $request->query('id');
            
            if (!$id) {
                return Response::error(null, 'Hero slider ID is required', 400);
            }

            $slider = HeroSlider::find($id);

            if (!$slider) {
                return Response::error(null, 'Hero slider not found', 404);
            }

            $validator = Validator::make($request->all(), [
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
                'heading' => 'nullable|string|max:255',
                'sub_heading' => 'nullable|string|max:255',
            ]);

            if ($validator->fails()) {
                return Response::error($validator->errors(), 'Validation failed', 422);
            }

            // Update image if new one is uploaded
            if ($request->hasFile('image')) {
                // Delete old image
                if ($slider->image && Storage::disk('public')->exists($slider->image)) {
                    Storage::disk('public')->delete($slider->image);
                }

                $image = $request->file('image');
                $imageName = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
                $imagePath = $image->storeAs('hero-sliders', $imageName, 'public');
                $slider->image = $imagePath;
            }

            if ($request->has('heading')) {
                $slider->heading = $request->heading;
            }
            
            if ($request->has('sub_heading')) {
                $slider->sub_heading = $request->sub_heading;
            }
            
            $slider->save();

            return Response::success($slider, 'Hero slider updated successfully');
        } catch (\Exception $e) {
            return Response::error($e->getMessage(), 'Failed to update hero slider', 500);
        }
    }
}
