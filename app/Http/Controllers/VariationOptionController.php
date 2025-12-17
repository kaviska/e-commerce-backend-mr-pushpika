<?php

namespace App\Http\Controllers;

use App\Helper\Response;
use App\Models\VariationOption;
use Illuminate\Http\Request;

class VariationOptionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $validated = $request->validate([
            'variation_id' => 'integer|exists:variations,id',
            'grouped' => 'sometimes|in:0,1,true,false', // Accept multiple formats
        ]);

        if ($request->has('variation_id')) {
            $variationOptions = VariationOption::where('variation_id', $validated['variation_id'])->get();
        } else {
            $variationOptions = VariationOption::with('variation')->orderBy('variation_id')->get();
        }

        // If grouped parameter is true, return data grouped by variation
        $isGrouped = $request->has('grouped') && in_array($request->grouped, [1, '1', true, 'true'], true);
        
        if ($isGrouped) {
            $grouped = [];
            
            foreach ($variationOptions as $option) {
                $variationName = $option->variation->name;
                $variationId = $option->variation->id;
                
                if (!isset($grouped[$variationName])) {
                    $grouped[$variationName] = [
                        'variation_id' => $variationId,
                        'variation_name' => $variationName,
                        'options' => []
                    ];
                }
                
                $grouped[$variationName]['options'][] = [
                    'id' => $option->id,
                    'name' => $option->name,
                    'variation_id' => $option->variation_id,
                ];
            }
            
            // Convert to indexed array
            $groupedArray = array_values($grouped);
            
            return Response::success($groupedArray, 'Variation options fetched successfully (grouped)');
        }

        // Default: helper for getting the name directly for easy access
        $variationOptions = $variationOptions->map(function ($variationOption) {
            $variationOption['variation'] = $variationOption->variation->name;
            return $variationOption;
        });

        return Response::success($variationOptions, 'Variation options fetched successfully');
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
            'variation_id' => 'required|integer|exists:variations,id',
            'name' => 'required|string|max:255|unique:variation_options,name',
        ]);

        $variationOption = VariationOption::create([
            'variation_id' => $validated['variation_id'],
            'name' => $validated['name'],
        ]);

        return Response::success($variationOption, 'Variation option created successfully');
    }

    /**
     * Display the specified resource.
     */
    public function show(VariationOption $variationOption)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(VariationOption $variationOption)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|integer|exists:variation_options,id',
            'variation_id' => 'integer|exists:variations,id',
            'name' => 'string|max:255|unique:variation_options,name',
        ]);

        $variationOption = VariationOption::find($validated['id']);

        if ($request->has('variation_id')) {
            $variationOption['variation_id'] = (int) $validated['variation_id'];
        }

        if ($request->has('name')) {
            $variationOption['name'] = $validated['name'];
        }

        $variationOption->save();

        return Response::success($variationOption, 'Variation option updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|integer|exists:variation_options,id',
        ]);

        $variationOption = VariationOption::find($validated['id']);
        $variationOption->delete();
        return Response::success($variationOption, 'Variation option deleted successfully');
    }

    public function getVariationForDelete(){
        $variationOptions = VariationOption::all();
      
        return Response::success($variationOptions, 'Variation options fetched successfully');
    }
}
