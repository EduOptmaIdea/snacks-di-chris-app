import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';

interface AlergenicFormData {
  id?: string;
  name: string;
}

interface AlergenicFormProps {
  initialData: Partial<AlergenicFormData> | null;
  onSubmit: (formData: AlergenicFormData) => Promise<void>;
  onCancel: () => void;
}

const AlergenicForm: React.FC<AlergenicFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<AlergenicFormData>({
    name: "",
    ...initialData, // Spread initial data if provided (for editing)
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // Update form state if initialData changes
    setFormData({
      name: "",
      ...initialData,
    });

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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      await onSubmit(formData);
      // onSubmit should handle closing the modal on success
    } catch (err: unknown) {
      console.error("Erro ao salvar categoria:", err);
      const errorMessage = err instanceof Error ? err.message : 'Falha ao salvar a alergênico.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500 text-sm p-2 bg-red-100 rounded">{error}</div>}

      {/* Form Fields */}
      <div>
        <label htmlFor="alergenic" className="block text-sm font-medium text-gray-700">Alergenice</label>
        <input type="text" name="alergenic" id="alergenic" value={formData.name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
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
          {isSubmitting ? 'Salvando...' : 'Salvar Alergenice'}
        </button>
      </div>
    </form>
  );
};

export default AlergenicForm;

