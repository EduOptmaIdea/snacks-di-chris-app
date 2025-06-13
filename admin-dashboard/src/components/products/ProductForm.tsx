import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import '../../styles/global.css'; // Import global styles

// Interface for the full product data used in the form
interface ProductFormData {
  id?: string; // Optional for new products
  productname: string;
  description: string;
  categoryRef: string;
  price: number;
  currentStock: number;
  available: boolean;
  descontinued: boolean;
  image?: string | null; // URL or null if no image
  ingredientRefs: string[];
  allergenicAgentRefs: string[];
  // Timestamps and user refs will be handled on submission
}

// Interface for reference data (e.g., categories)
interface ReferenceItem {
  id: string;
  name: string; // Assuming 'name' field for ingredients/allergens, 'category' for categories
}

interface ProductFormProps {
  initialData: Partial<ProductFormData> | null; // Partial for new product, null if truly empty
  onSubmit: (formData: ProductFormData, imageFile?: File | null) => Promise<void>;
  onCancel: () => void;
  // Mock data for now, replace with actual fetched data
  categories: ReferenceItem[];
  ingredients: ReferenceItem[];
  allergens: ReferenceItem[];
}

const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  categories = [], // Default to empty arrays
  ingredients = [],
  allergens = []
}) => {
  const [formData, setFormData] = useState<ProductFormData>({
    productname: '',
    description: '',
    categoryRef: '',
    price: 0,
    currentStock: 0,
    available: true, // Default available
    descontinued: false, // Default active (not descontinued)
    image: null,
    ingredientRefs: [],
    allergenicAgentRefs: [],
    ...initialData, // Spread initial data if provided (for editing)
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(formData.image || '/default.webp');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Update form state if initialData changes (e.g., selecting a different product to edit)
    setFormData({
      productname: '',
      description: '',
      categoryRef: '',
      price: 0,
      currentStock: 0,
      available: true,
      descontinued: false,
      image: null,
      ingredientRefs: [],
      allergenicAgentRefs: [],
      ...initialData,
    });
    setImagePreview(initialData?.image || '/default.webp');
    setImageFile(null); // Reset file on data change
  }, [initialData]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;

      if (name === 'ingredientRefs' || name === 'allergenicAgentRefs') {
        setFormData(prev => ({
          ...prev,
          [name]: checked
            ? [...prev[name], value]
            : prev[name].filter(ref => ref !== value),
        }));
      } else {
        setFormData(prev => {
          const updatedForm = { ...prev, [name]: checked };

          // Se marcar como descontinuado: zera o estoque e torna indisponível
          // Regras especiais:
          if (type === 'checkbox') {
            const input = e.target as HTMLInputElement;
            const checked = input.checked;

            const updatedForm = { ...prev, [name]: checked };

            if (name === 'descontinued' && checked) {
              updatedForm.currentStock = 0;
              updatedForm.available = false;
            } else if (name === 'available' && checked && prev.descontinued) {
              updatedForm.descontinued = false;
            }

            return updatedForm;
          }
          return updatedForm;
        });
      }
    } else {
      const newValue = type === 'number' ? parseFloat(value) || 0 : value;

      setFormData(prev => {
        const updatedForm = { ...prev, [name]: newValue };

        // Se estoque for alterado para 0, tornar indisponível
        if (name === 'currentStock' && parseInt(value) === 0) {
          updatedForm.available = false;
        }

        return updatedForm;
      });
    }
  };


  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      // If no file is selected, potentially revert to original or default
      // For simplicity, we keep the current preview unless a new file is chosen
      // setImageFile(null);
      // setImagePreview(formData.image || '/default.webp'); 
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      // Pass the complete formData and the potential new image file
      await onSubmit(formData, imageFile);
      // onSubmit should handle closing the modal on success
    } catch (err: unknown) { // Usar unknown é mais seguro
      console.error("Erro ao salvar produto:", err);
      // Extrair mensagem de erro de forma segura
      const errorMessage = err instanceof Error ? err.message : 'Falha ao salvar o produto.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500 text-sm p-2 bg-red-100 rounded">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Image Upload and Preview */}
        <div className="md:col-span-1 flex justify-center items-start">
          <div className="flex flex-col items-center space-y-2">
            <img
              src={imagePreview || '/default.webp'}
              alt="Pré-visualização"
              className="h-32 w-32 object-cover rounded border border-gray-300 mb-2"
              onError={(e) => (e.currentTarget.src = '/default.webp')}
            />
            <input
              type="file"
              id="imageUpload"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        </div>

        {/* Form Fields */}
        <div className="md:col-span-2 space-y-4">

          {/* Nome do Produto em linha separada */}
          <div>
            <label htmlFor="productname" className="block text-sm font-bold text-[#A9373E] mb-1">
              Nome do Produto
            </label>
            <input
              type="text"
              name="productname"
              id="productname"
              value={formData.productname}
              onChange={handleChange}
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-[#A9373E] font-semibold px-3 py-3 sm:text-sm"
            />
          </div>

          {/* Demais campos em grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="categoryRef" className="block text-sm font-medium text-gray-700">Categoria</label>
              <select
                name="categoryRef"
                id="categoryRef"
                value={formData.categoryRef}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-3 sm:text-sm"
              >
                <option value="">Selecione...</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">Valor (R$)</label>
              <input
                type="number"
                name="price"
                id="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-3 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="currentStock" className="block text-sm font-medium text-gray-700">Estoque Atual</label>
              <input
                type="number"
                name="currentStock"
                id="currentStock"
                value={formData.currentStock}
                onChange={handleChange}
                required
                min="0"
                step="1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-3 sm:text-sm"
              />
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
            <textarea
              name="description"
              id="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 sm:text-sm"
            />
          </div>
        </div>


        {/* Toggles*/}
        <div className="flex flex-col space-y-4">
          {/* Disponível para venda */}
          <div className="flex items-center space-x-4">
            <label htmlFor="available" className="flex items-center cursor-pointer space-x-2">
              <span className="text-sm text-gray-900">Disponível para Venda</span>
              <input
                id="available"
                name="available"
                type="checkbox"
                checked={formData.available}
                onChange={handleChange}
                className="peer sr-only"
              />
              <div className="w-11 h-6 bg-gray-200 peer-checked:bg-green-500 rounded-full relative transition duration-300 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
            </label>
          </div>


          {/* Produto descontinuado */}
          <div className="flex items-center space-x-4">
            <label htmlFor="descontinued" className="flex items-center cursor-pointer space-x-2">
              <span className="text-sm text-gray-900">Produto Descontinuado (Inativo)</span>
              <input
                id="descontinued"
                name="descontinued"
                type="checkbox"
                checked={formData.descontinued}
                onChange={handleChange}
                className="peer sr-only"
              />
              <div className="w-11 h-6 bg-gray-200 peer-checked:bg-red-500 rounded-full relative transition duration-300 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
            </label>
          </div>

        </div>


        {/* Ingredientes (lista vertical ordenada) */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Ingredientes</label>
          <div className="flex flex-col gap-2 max-h-40 overflow-y-auto border p-2 rounded-md">
            {ingredients
              .slice()
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(ing => (
                <div key={ing.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`ing-${ing.id}`}
                    name="ingredientRefs"
                    value={ing.id}
                    checked={formData.ingredientRefs.includes(ing.id)}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor={`ing-${ing.id}`} className="ml-2 block text-sm text-gray-900">{ing.name}</label>
                </div>
              ))}
          </div>
        </div>

        {/* Agentes Alergênicos (lista vertical ordenada) */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Agentes Alergênicos</label>
          <div className="flex flex-col gap-2 max-h-40 overflow-y-auto border p-2 rounded-md">
            {allergens
              .slice()
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(alg => (
                <div key={alg.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`alg-${alg.id}`}
                    name="allergenicAgentRefs"
                    value={alg.id}
                    checked={formData.allergenicAgentRefs.includes(alg.id)}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor={`alg-${alg.id}`} className="ml-2 block text-sm text-gray-900">{alg.name}</label>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm font-medium disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Salvando...' : 'Salvar Produto'}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;