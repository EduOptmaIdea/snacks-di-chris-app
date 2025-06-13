import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../../../src/firebase'; // Ajustado para o caminho correto
import { useAuth } from '../../context/useAuth'; // Hook de autenticação

// Importar componentes filhos (serão criados/adaptados)
import CategoryTable from './CategoryTable';
import CategoryModal from './CategoryModal';
import ViewCategoryModal from './ViewCategoryModal'; // Modal genérico para o formulário
import CategoryForm from './CategoryForm';
import DeleteCategoryModal from './DeleteCategoryModal';

// Interfaces
interface UserReferenceItem {
  id: string;
  userName: string;
}

interface ReferenceMap {
  [key: string]: string;
}

interface CategoryData {
  id: string;
  category?: string; // Ajustado para categoryName
  description?: string;
  order?: number; // Adicionado campo order
  active?: boolean; // Adicionado campo active
  createdAt?: Timestamp;
  createdBy?: string; // User ID
  updatedAt?: Timestamp;
  lastUpdatedBy?: string; // User ID
  image?: string | null; // Mantido campo image conforme código anterior
}

interface CategoryFormData {
  id?: string;
  category: string;
  description: string;
  activeCategory: boolean;
  image?: string | null;
}

interface CategoryPermissions {
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
}

const Categories: React.FC = () => {
  const { currentUser, adminUser } = useAuth();
  const [categoriesData, setCategoriesData] = useState<CategoryData[]>([]);
  const [usersMap, setUsersMap] = useState<ReferenceMap>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Estado para Modais
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Derivar permissões do usuário logado para categorias
  const permissions = React.useMemo<CategoryPermissions>(() => {
    const userPermissions = adminUser?.permissions?.categories || []; // Permissões de categorias
    const isMaster = adminUser?.role === 'master';
    const isActive = adminUser?.available === true;
    return {
      canRead: isActive && (isMaster || userPermissions.includes('read')),
      canWrite: isActive && (isMaster || userPermissions.includes('write')),
      canDelete: isActive && (isMaster || userPermissions.includes('delete')),
    };
  }, [adminUser]);

  // Função para buscar dados de categorias
  const fetchData = useCallback(async () => {
    if (!permissions.canRead) {
      setError('Você não tem permissão para visualizar categorias.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const categoriesSnapshot = await getDocs(collection(db, 'categories'));
      const categoriesList = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as CategoryData[];
      categoriesList.sort((a, b) => (a.category ?? '').localeCompare(b.category ?? ''));
      setCategoriesData(categoriesList);

      // Buscar Usuários (para mapear IDs para nomes)
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, userName: doc.data().userName || 'Desconhecido' })) as UserReferenceItem[];
      setUsersMap(usersList.reduce((acc, cur) => ({ ...acc, [cur.id]: cur.userName }), {}));

    } catch (err) {
      console.error("Erro ao buscar categorias:", err);
      setError('Falha ao carregar categorias. Verifique o console para mais detalhes.');
    } finally {
      setLoading(false);
    }
  }, [permissions.canRead]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Handlers para Ações ---

  const handleView = (category: CategoryData) => {
    if (!permissions.canRead) return;
    setSelectedCategory(category);
    setIsViewModalOpen(true);
  };

  const handleAddNew = () => {
    if (!permissions.canWrite) return;
    setSelectedCategory(null);
    setIsEditing(false);
    setIsFormModalOpen(true);
  };

  const handleEdit = (category: CategoryData) => {
    if (!permissions.canWrite) return;
    setSelectedCategory(category);
    setIsEditing(true);
    setIsFormModalOpen(true);
  };

  const handleDelete = (category: CategoryData) => {
    if (!permissions.canDelete) return;
    setSelectedCategory(category);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsViewModalOpen(false);
    setIsFormModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedCategory(null);
  };

  // --- Funções de Interação com Backend (Firestore/Storage) ---

  const uploadImage = async (categoryId: string, imageFile: File): Promise<string> => {
    const imageRef = ref(storage, `categories/${categoryId}_${Date.now()}_${imageFile.name}`);
    const snapshot = await uploadBytes(imageRef, imageFile);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  };

  const deleteImage = async (imageUrl: string | undefined | null) => {
    if (!imageUrl || imageUrl.includes('default.webp')) return; // Não deletar imagem padrão
    try {
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
      console.log('Imagem anterior deletada:', imageUrl);
    } catch (error: unknown) { // Usar unknown
      // Ignorar erro se o arquivo não existir (ex: já deletado)
      const storageError = error as { code?: string }; // Type assertion
      if (storageError?.code !== 'storage/object-not-found') {
        // Extrair mensagem de erro de forma segura
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("Erro ao deletar imagem antiga:", errorMessage);
        // Não bloquear a operação principal por falha na deleção da imagem antiga
      }
    }
  };

  // --- Funções de Interação com Backend (Firestore) ---

  const handleFormSubmit = async (formData: CategoryFormData, imageFile?: File | null) => {
    if (!permissions.canWrite || !currentUser) {
      throw new Error("Permissão negada ou usuário não autenticado.");
    }

    let imageUrl = formData.image; // Manter imagem existente por padrão

    // 1. Upload de nova imagem (se houver)
    if (imageFile) {
      // Deletar imagem antiga ANTES de fazer upload da nova (se estiver editando)
      if (isEditing && selectedCategory?.image) {
        await deleteImage(selectedCategory.image);
      }
      // Fazer upload da nova imagem (usar ID do produto se editando, ou um placeholder se adicionando)
      const tempIdForUpload = formData.id || `new_${Date.now()}`;
      imageUrl = await uploadImage(tempIdForUpload, imageFile);
    }

    const dataToSave = {
      ...formData,
      image: imageUrl,
      updatedAt: Timestamp.now(),
      lastUpdatedBy: currentUser.uid,
    };

    try {
      if (isEditing && formData.id) {
        // Atualizar Categoria Existente
        const categoryRef = doc(db, 'categories', formData.id);
        const { ...updateData } = dataToSave; // Remover id antes de salvar
        await updateDoc(categoryRef, updateData);
        console.log('Categoria atualizada:', formData.id);
      } else {
        // Adicionar Nova Categoria
        const saveData = {
          ...dataToSave,
          createdAt: Timestamp.now(),
          createdBy: currentUser.uid,
        };
        delete saveData.id; // Remover id se existir
        const docRef = await addDoc(collection(db, 'categories'), saveData);
        console.log('Nova categoria adicionada:', docRef.id);
      }
      handleCloseModals();
      await fetchData(); // Recarregar dados
    } catch (err) {
      console.error("Erro ao salvar categoria:", err);
      // Extrair mensagem de erro de forma segura
      const errorMessage = err instanceof Error ? err.message : 'Falha ao salvar a categoria.';
      setError(errorMessage); // Exibir erro no formulário ou modal
      throw new Error(errorMessage); // Propagar erro para o formulário tratar
    }
  };

  const handleDeleteConfirm = async () => {
    if (!permissions.canDelete || !selectedCategory || !selectedCategory.id) {
      console.error('Permissão negada ou categoria não selecionada para exclusão.');
      handleCloseModals();
      return;
    }

    try {
      await deleteDoc(doc(db, 'categories', selectedCategory.id));
      console.log('Categoria excluída:', selectedCategory.id);
      handleCloseModals();
      await fetchData(); // Recarregar dados
    } catch (err) {
      console.error("Erro ao excluir categoria:", err);
      setError('Falha ao excluir categoria.');
      handleCloseModals();
    }
  };

  // --- Renderização ---

  return (
    <div className="admin-container p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Gerenciamento de Categorias</h1>
        {permissions.canWrite && (
          <button
            onClick={handleAddNew}
            className="bg-[#efb42b] hover:bg-[#d9a326] text-[#333] font-bold py-2 px-4 rounded shadow"
          >
            + Nova Categoria
          </button>
        )}
      </div>

      {loading && <div className="text-center py-4">Carregando...</div>}
      {error && !loading && <div className="text-red-500 text-center py-4 bg-red-100 rounded">{error}</div>}

      {!loading && !error && permissions.canRead && (
        <CategoryTable
          categories={categoriesData}
          permissions={permissions}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        // Não há necessidade de 'onView' separado para categorias simples
        />
      )}
      {!loading && !error && !permissions.canRead && (
        <div className="text-center py-4 text-gray-500">Você não tem permissão para visualizar categorias.</div>
      )}

      {/* Modais */}
      <ViewCategoryModal
        isOpen={isViewModalOpen}
        onClose={handleCloseModals}
        category={selectedCategory}
        usersMap={usersMap}
      />

      <CategoryModal
        isOpen={isFormModalOpen}
        onClose={handleCloseModals}
        title={isEditing ? 'Editar Categoria' : 'Adicionar Nova Categoria'}
      >
        <CategoryForm
          initialData={isEditing ? selectedCategory : null}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseModals}
        />
      </CategoryModal>

      <DeleteCategoryModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseModals}
        onConfirm={handleDeleteConfirm}
        category={selectedCategory?.category}
      />

    </div>
  );
};

export default Categories;

