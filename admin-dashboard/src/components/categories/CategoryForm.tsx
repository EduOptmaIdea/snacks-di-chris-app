import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';

// Interface para os dados da categoria no formulário
interface CategoryFormData {
  id?: string; // Opcional para novas categorias
  category: string;
  description: string;
  activeCategory: boolean;
  image?: string | null; // URL da imagem, pode ser null se não houver imagem
}

interface CategoryFormProps {
  initialData: Partial<CategoryFormData> | null;
  onSubmit: (formData: CategoryFormData, imageFile?: File | null) => Promise<void>;
  onCancel: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<CategoryFormData>({
    category: "",
    description: "",
    activeCategory: true, // Default activeCategory
    image: null,
    ...initialData, // Spread initial data if provided (for editing)
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(formData.image || '/default.webp');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // Update form state if initialData changes
    setFormData({
      category: "",
      description: "",
      activeCategory: true,
      image: null,
      ...initialData,
    });
    setImagePreview(initialData?.image || '/default.webp');
    setImageFile(null); // Reset file on data change

    setError(""); // Clear error on data change
  }, [initialData]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      // Handle 'activeCategory' toggle (checked=true means activeCategory=true)
      setFormData(prev => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseInt(value, 10) || 0 : value, // Use parseInt for order
      }));
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
    setError("");
    try {
      await onSubmit(formData, imageFile);
      // onSubmit should handle closing the modal on success
    } catch (err: unknown) {
      console.error("Erro ao salvar categoria:", err);
      const errorMessage = err instanceof Error ? err.message : 'Falha ao salvar a categoria.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500 text-sm p-2 bg-red-100 rounded">{error}</div>}

      {/* Image Upload and Preview */}
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

      {/* Form Fields */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">Nome da Categoria</label>
        <input type="text" name="category" id="category" value={formData.category} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
        <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"></textarea>
      </div>

      {/* Toggle */}
      <div className="flex items-center">
        <input
          type="checkbox"
          name="activeCategory"
          id="activeCategory"
          checked={formData.activeCategory}
          onChange={handleChange}
          className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        />
        <label htmlFor="activeCategory" className="ml-2 block text-sm text-gray-900">Categoria Ativa</label>
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
          {isSubmitting ? 'Salvando...' : 'Salvar Categoria'}
        </button>
      </div>
    </form>
  );
};

export default CategoryForm;

