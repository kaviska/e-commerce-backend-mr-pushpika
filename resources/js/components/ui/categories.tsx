import { Category } from "@/types/data";

export default function Categories({ categories, selectedCategory, setSelectedCategory }: { categories: Category[], selectedCategory: Category | null, setSelectedCategory: (category: Category) => void }) {
    return (
        <div className="flex flex-col gap-4">
            {categories.map((category) => (
                <div key={category.id} className={`bg-gray-700 flex gap-2 items-center hover:bg-gray-950 transition-colors duration-300 p-2 rounded-xl cursor-pointer ${selectedCategory?.id === category.id ? 'bg-gray-950' : ''}`} onClick={() => setSelectedCategory(category)}>
                    <img src={category.image} alt={category.name} className="h-12 aspect-square object-contain" />
                    <h2 className="text-center text-lg font-bold">{category.name}</h2>
                </div>
            ))}
        </div>
    );
}
