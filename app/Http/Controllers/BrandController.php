<?php

namespace App\Http\Controllers;

use App\Helper\Response;
use App\Models\Brand;
use Illuminate\Http\Request;

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
        $request->validate([
            'name' => 'required|string|max:255|unique:brands,name',
        ]);

        $brand = Brand::create([
            'name' => $request->name,
        ]);
        return Response::success($brand, 'Brand created successfully', 201);
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
    public function update(Request $request)
    {
        $request->validate([
            'id' => 'required|string|exists:brands,id',
            'name' => 'required|string|max:255',
        ]);

        $brand = Brand::find($request->id);
        $brand->update([
            'name' => $request->name,
        ]);
        return Response::success($brand, 'Brand updated successfully', 201); 
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request)
    {
        try {
            $request->validate([
                'id' => 'required|string|exists:brands,id',
            ]);

            $brand = Brand::find($request->id);
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
