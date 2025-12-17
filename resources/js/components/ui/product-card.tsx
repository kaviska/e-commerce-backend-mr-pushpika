import { useEffect, useState } from "react";
import { Button } from "./button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./card";
import { Product, Stock, Variation, VariationStock } from "@/types/data";
import { useApi } from "@/hooks/api/use-api";


interface VariationItem {
    type: string;
    items: VariationStock[];
}

export default function ProductCard({ product }: { product: Product|undefined }) {
    const [variationsList, setVariationsList] = useState<VariationItem[]|null>([]);
    const [variationTypesList, setVariationTypesList] = useState<string[]|null>([]);

    useEffect(() => {
        getVariationsList(product?.stocks);

        console.log(variationTypesList);
        
    }, []);

    function selectVariation(variation: VariationStock) {
        console.log(`Variation selected: ${variation.variation_option.name}`);
        alert(`Variation selected: ${variation.stock_id}`);
    }



    function getVariationsList(stocks: Stock[]|undefined) {
        if (!stocks) return;

        let tempVariationsList: VariationItem[] = [];
        let tempVariationTypesList: string[] = [];

        stocks.forEach(stock => {
            stock.variation_stocks.forEach((variationStock: VariationStock) => {
                const variationType = variationStock.variation_option.variation.name;
                const variationItem = tempVariationsList.find(item => item.type === variationType);
                if (variationItem) {
                    variationItem.items.push(variationStock);
                } else {
                    tempVariationsList.push({
                        type: variationType,
                        items: [variationStock]
                    });
                }

                if (!tempVariationTypesList.includes(variationType)) {
                    tempVariationTypesList.push(variationType);
                }
            });
        });

        setVariationsList(tempVariationsList);
        setVariationTypesList(tempVariationTypesList);
    }

    if (!product) return <div>No product found</div>;

    return (
        <Card className="w-1/1 lg:w-1/4 h-fill">
            <CardHeader>
                <CardTitle>{product.name}</CardTitle>
            </CardHeader>
            <CardContent>
                <img src={product.primary_image} alt={product.name} className="w-full h-48 object-cover rounded-lg hover:scale-105 transition-transform duration-300" />
                <p className="mt-5 text-sm text-gray-400">{product.description.slice(0, 50)}...</p>

                <div className="flex flex-wrap gap-2 mt-5">
                    {variationTypesList?.map((variationType) => (
                        <div key={variationType} className="flex flex-col gap-2 bg-gray-800 px-2 py-1 rounded-sm">
                            <span>{variationType}</span>
                            <div className="flex flex-wrap gap-2">
                                {
                                    variationsList?.filter(variation => variation.type === variationType).map(variation => {
                                        return variation?.items.map((item: VariationStock, index: number) => {
                                            return <p onClick={() => selectVariation(item)} key={index} className="text-sm bg-gray-700 px-2 py-1 rounded-sm">{item.variation_option.name}</p>;
                                        });
                                    })
                                }
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
            <CardFooter>
                <Button>View Product</Button>
            </CardFooter>
        </Card>
    );
}
