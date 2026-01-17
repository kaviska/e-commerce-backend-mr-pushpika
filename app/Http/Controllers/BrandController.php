<?php

namespace App\Http\Controllers;

use App\Helper\Response;
use App\Models\Brand;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BrandController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $request->validate([
            'id' => 'string|exists:brands,id',
            'name' => 'string|exists:brands,name',
        ]);

        // Fetch a single brand
        if ($request->has('id')) {
            $brand = Brand::find($request->id);
            return Response::success($brand, 'Successfully fetched brand by id');
        }

        // Fetch a brand by name
        if ($request->has('name')) {
            $brand = Brand::where('name', $request->name)->first();
            return Response::success($brand, 'Successfully fetched brand by name');
        }

        // Fetch all brands
        $brands = Brand::all();
        return Response::success($brands, 'Successfully fetched all brands');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:brands,name',
            'image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $slug = Str::slug($validated['name']);

        try {
            $imagePath = null;

            // save image to storage if provided
            if ($request->hasFile('image')) {
                $imageFile = $request->file('image');
                $fileName = $slug . '.' . $imageFile->extension();
                $imageFile = Storage::disk('brands')->putFileAs('/', $imageFile, $fileName);
                $imagePath = "storage/images/brands/$imageFile";
            }

            // save brand in DB
            $brand = Brand::create([
                'name' => $validated['name'],
                'image' => $imagePath,
            ]);
            return Response::success($brand, 'Brand created successfully', 201);
        } catch (\Throwable $th) {
            return Response::error($th->getMessage(), 'Failed to create brand', 201);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Brand $brand)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Brand $brand)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $brand = Brand::find($id);

        if (!$brand) {
            return Response::error('Brand not found', 'Brand not found', 404);
        }

        if ($request->has('name')) {
            $brand->name = $request->name;
        }

        if ($request->hasFile('image')) {
            // delete old image if exists
            if ($brand->image) {
                $oldImage = $brand->image; // ex: storage/images/brands/slug.jpg
                $fileName = basename($oldImage);
                if (Storage::disk('brands')->delete($fileName)) {
                    Log::info("Old image deleted successfully");
                }
            }

            // save new image
            $slug = Str::slug($brand->name);
            $imageFile = $request->file('image');
            $fileName = $slug . '.' . $imageFile->extension();
            $imageFile = Storage::disk('brands')->putFileAs('/', $imageFile, $fileName);
            $brand->image = "storage/images/brands/$imageFile";
        }

        $brand->save(); // save changes

        return Response::success($brand, 'Brand updated successfully', 201); 
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request)
    {
        try {
            $validated = $request->validate([
                'id' => 'required|string|exists:brands,id',
            ]);

            $brand = Brand::find($validated['id']);

            // delete image if exists
            if ($brand->image) {
                $fileName = basename($brand->image);
                Storage::disk('brands')->delete($fileName);
            }

            $brand->delete();
            return Response::success($brand, 'Brand deleted successfully');
        } catch (\Illuminate\Database\QueryException $e) {
            // Check if it's a foreign key constraint violation
            if ($e->getCode() === '23000') {
                return Response::error('Cannot delete this brand because it is associated with existing products. Please remove or reassign all products first.', 'Foreign key constraint violation', 409);
            }
            return Response::error($e->getMessage(), 'Failed to delete brand', 500);
        } catch (\Throwable $th) {
            return Response::error($th->getMessage(), 'Failed to delete brand', 500);
        }
    }
}
