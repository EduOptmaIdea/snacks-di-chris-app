import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../../../../src/firebase'; // Ajustado para o caminho correto
import { useAuth } from '../../context/useAuth'; // Hook de autenticação

// Importar componentes filhos (serão criados/adaptados)
import IngredientTable from './IngredientTable';
import IngredientModal from './IngredientModal';
import IngredientForm from './IngredientForm';
import DeleteIngredientModal from './DeleteIngredientModal';
import ViewIngredientModal from './ViewIngredientModal';

// Interfaces específicas para Ingredientes
interface IngredientData {
  id: string;
  name?: string;
  createdAt?: Timestamp;
  createdBy?: string;
  updatedAt?: Timestamp;
  lastUpdatedBy?: string;
}

interface IngredientFormData {
  id?: string;
  name?: string;
}

interface IngredientPermissions {
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
}

const Ingredients: React.FC = () => {
  const { currentUser, adminUser } = useAuth();
  const [ingredientsData, setIngredientsData] = useState<IngredientData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Estado para Modais
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedIngredient, setSelectedIngredient] = useState<IngredientData | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Derivar permissões do usuário logado para ingredientes
  const permissions = React.useMemo<IngredientPermissions>(() => {
    const userPermissions = adminUser?.permissions?.ingredients || []; // Permissões de ingredientes
    const isMaster = adminUser?.role === 'master';
    const isActive = adminUser?.available === true;
    return {
      canRead: isActive && (isMaster || userPermissions.includes('read')),
      canWrite: isActive && (isMaster || userPermissions.includes('write')),
      canDelete: isActive && (isMaster || userPermissions.includes('delete')),
    };
  }, [adminUser]);

  // Função para buscar dados de inngredientes
  const fetchData = useCallback(async () => {
    if (!permissions.canRead) {
      setError('Você não tem permissão para visualizar os ingredientes cadastrados.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const ingredientsSnapshot = await getDocs(collection(db, 'ingredientsList'));
      const ingredientsList = ingredientsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as IngredientData[];
      ingredientsList.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
      setIngredientsData(ingredientsList);
    } catch (err) {
      console.error("Erro ao buscar ingredientes:", err);
      setError('Falha ao carregar ingredientes. Verifique o console para mais detalhes.');
    } finally {
      setLoading(false);
    }
  }, [permissions.canRead]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Handlers para Ações ---

  const handleView = (ingredient: IngredientData) => {
    if (!permissions.canRead) return;
    setSelectedIngredient(ingredient);
    setIsViewModalOpen(true);
  };

  const handleAddNew = () => {
    if (!permissions.canWrite) return;
    setSelectedIngredient(null);
    setIsEditing(false);
    setIsFormModalOpen(true);
  };

  const handleEdit = (ingredient: IngredientData) => {
    if (!permissions.canWrite) return;
    setSelectedIngredient(ingredient);
    setIsEditing(true);
    setIsFormModalOpen(true);
  };

  const handleDelete = (ingredient: IngredientData) => {
    if (!permissions.canDelete) return;
    setSelectedIngredient(ingredient);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsViewModalOpen(false);
    setIsFormModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedIngredient(null);
  };

  // --- Funções de Interação com Backend (Firestore) ---

  const handleFormSubmit = async (formData: IngredientFormData) => {
    if (!permissions.canWrite || !currentUser) {
      throw new Error("Permissão negada ou usuário não autenticado.");
    }
    const dataToSave = {
      ...formData,
      updatedAt: Timestamp.now(),
      lastUpdatedBy: currentUser.uid,
    };

    try {
      if (isEditing && formData.id) {
        // Atualizar ingrediente Existente
        const ingredientRef = doc(db, 'ingredientsList', formData.id);
        const { ...updateData } = dataToSave; // Remover id antes de salvar
        await updateDoc(ingredientRef, updateData);
        console.log('Ingrediente atualizado:', formData.id);
      } else {
        // Adicionar Novo Ingrediente
        const saveData = {
          ...dataToSave,
          createdAt: Timestamp.now(),
          createdBy: currentUser.uid,
        };
        delete saveData.id; // Remover id se existir
        const docRef = await addDoc(collection(db, 'ingredients'), saveData);
        console.log('Novo ingrediente adicionado:', docRef.id);
      }
      handleCloseModals();
      await fetchData(); // Recarregar dados
    } catch (err) {
      console.error("Erro ao salvar ingrediente:", err);
      // Extrair mensagem de erro de forma segura
      const errorMessage = err instanceof Error ? err.message : 'Falha ao salvar ingrediente.';
      setError(errorMessage); // Exibir erro no formulário ou modal
      throw new Error(errorMessage); // Propagar erro para o formulário tratar
    }
  };

  const handleDeleteConfirm = async () => {
    if (!permissions.canDelete || !selectedIngredient || !selectedIngredient.id) {
      console.error('Permissão negada ou ingrediente não selecionado para exclusão.');
      handleCloseModals();
      return;
    }

    try {
      await deleteDoc(doc(db, 'ingredients', selectedIngredient.id));
      console.log('Ingrediente excluído:', selectedIngredient.id);
      handleCloseModals();
      await fetchData(); // Recarregar dados
    } catch (err) {
      console.error("Erro ao excluir ingrediente:", err);
      setError('Falha ao excluir ingrediente.');
      handleCloseModals();
    }
  };

  // --- Renderização ---

  return (
    <div className="admin-container p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Gerenciamento de Ingredientes</h1>
        {permissions.canWrite && (
          <button
            onClick={handleAddNew}
            className="bg-[#efb42b] hover:bg-[#d9a326] text-[#333] font-bold py-2 px-4 rounded shadow"
          >
            + Novo Ingrediente
          </button>
        )}
      </div>

      {loading && <div className="text-center py-4">Carregando...</div>}
      {error && !loading && <div className="text-red-500 text-center py-4 bg-red-100 rounded">{error}</div>}

      {!loading && !error && permissions.canRead && (
        <IngredientTable
          ingredients={ingredientsData}
          permissions={permissions}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
      {!loading && !error && !permissions.canRead && (
        <div className="text-center py-4 text-gray-500">Você não tem permissão para visualizar os ingredientes.</div>
      )}

      {/* Modais */}
      <ViewIngredientModal
        isOpen={isViewModalOpen}
        onClose={handleCloseModals}
        ingredient={selectedIngredient}
      />

      <IngredientModal
        isOpen={isFormModalOpen}
        onClose={handleCloseModals}
        title={isEditing ? 'Editar Ingrediente' : 'Adicionar Novo Ingrediente'}
      >
        <IngredientForm
          initialData={isEditing ? selectedIngredient : null}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseModals}
        />
      </IngredientModal>

      <DeleteIngredientModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseModals}
        onConfirm={handleDeleteConfirm}
        ingredient={selectedIngredient?.name}
      />

    </div>
  );
};

export default Ingredients;

