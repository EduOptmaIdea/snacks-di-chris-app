import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../../../src/firebase'; // Ajustado para o caminho correto
import { useAuth } from '../../context/useAuth'; // Hook de autenticação

// Importar componentes filhos
import ProductTable from './ProductTable';
import ViewProductModal from './ViewProductModal';
import DeleteProductModal from './DeleteProductModal';
import ProductModal from './ProductModal'; // Modal genérico para o formulário
import ProductForm from './ProductForm';

// Interfaces (podem ser movidas para um arquivo de tipos)
interface ReferenceItem {
  id: string;
  name: string;
}

interface UserReferenceItem {
  id: string;
  userName: string; // Assumindo que o campo no Firestore é userName
}

interface ReferenceMap {
  [key: string]: string;
}

interface ProductData {
  id: string;
  productname?: string;
  description?: string;
  categoryRef?: string;
  price?: number;
  currentStock?: number;
  available?: boolean;
  descontinued?: boolean;
  image?: string | null;
  ingredientRefs?: string[];
  allergenicAgentRefs?: string[];
  createdAt?: Timestamp;
  createdBy?: string;
  updatedAt?: Timestamp;
  lastUpdatedBy?: string;
  timesOrder?: number;
  views?: number;
}

interface ProductFormData {
  id?: string;
  productname: string;
  description: string;
  categoryRef: string;
  price: number;
  currentStock: number;
  available: boolean;
  descontinued: boolean;
  image?: string | null;
  ingredientRefs: string[];
  allergenicAgentRefs: string[];
}

interface ProductPermissions {
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
}

const Products: React.FC = () => {
  const { currentUser, adminUser } = useAuth(); // Obter usuário logado e dados admin
  const [products, setProducts] = useState<ProductData[]>([]);
  const [categories, setCategories] = useState<ReferenceItem[]>([]);
  const [ingredients, setIngredients] = useState<ReferenceItem[]>([]);
  const [allergens, setAllergens] = useState<ReferenceItem[]>([]);
  const [categoriesMap, setCategoriesMap] = useState<ReferenceMap>({});
  const [ingredientsMap, setIngredientsMap] = useState<ReferenceMap>({});
  const [allergensMap, setAllergensMap] = useState<ReferenceMap>({});
  const [usersMap, setUsersMap] = useState<ReferenceMap>({}); // Mapa de usuários (ID -> Nome)
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Estado para Modais
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Derivar permissões do usuário logado (usando adminUser)
  const permissions = React.useMemo<ProductPermissions>(() => {
    const userPermissions = adminUser?.permissions?.products || []; // Usar adminUser
    const isMaster = adminUser?.role === 'master'; // Usar adminUser
    const isActive = adminUser?.available === true; // Usar adminUser
    return {
      canRead: isActive && (isMaster || userPermissions.includes('read')),
      canWrite: isActive && (isMaster || userPermissions.includes('write')),
      canDelete: isActive && (isMaster || userPermissions.includes('delete')),
    };
  }, [adminUser]); // Depender de adminUser

  // Função para buscar todos os dados necessários
  const fetchData = useCallback(async () => {
    if (!permissions.canRead) {
      setError('Você não tem permissão para visualizar produtos.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      // Buscar Produtos
      const productsSnapshot = await getDocs(collection(db, 'products'));
      const productsList = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ProductData[];
      setProducts(productsList);

      // Buscar Categorias
      const categoriesSnapshot = await getDocs(collection(db, 'categories'));
      const categoriesList = categoriesSnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().category || 'Sem nome' })) as ReferenceItem[];
      setCategories(categoriesList);
      setCategoriesMap(categoriesList.reduce((acc, cur) => ({ ...acc, [cur.id]: cur.name }), {}));

      // Buscar Ingredientes
      const ingredientsSnapshot = await getDocs(collection(db, 'ingredientsList'));
      const ingredientsList = ingredientsSnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name || 'Sem nome' })) as ReferenceItem[];
      setIngredients(ingredientsList);
      setIngredientsMap(ingredientsList.reduce((acc, cur) => ({ ...acc, [cur.id]: cur.name }), {}));

      // Buscar Alergênicos
      const allergensSnapshot = await getDocs(collection(db, 'allergenicAgentsList'));
      const allergensList = allergensSnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name || 'Sem nome' })) as ReferenceItem[];
      setAllergens(allergensList);
      setAllergensMap(allergensList.reduce((acc, cur) => ({ ...acc, [cur.id]: cur.name }), {}));

      // Buscar Usuários (para mapear IDs para nomes)
      const usersSnapshot = await getDocs(collection(db, 'adminUser'));
      const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, userName: doc.data().userName || 'Desconhecido' })) as UserReferenceItem[]; // Assumindo campo 'userName'
      setUsersMap(usersList.reduce((acc, cur) => ({ ...acc, [cur.id]: cur.userName }), {}));

    } catch (err) {
      console.error("Erro ao buscar dados:", err);
      setError('Falha ao carregar dados. Verifique o console para mais detalhes.');
    } finally {
      setLoading(false);
    }
  }, [permissions.canRead]); // Depende da permissão de leitura

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Handlers para Ações ---

  const handleView = (product: ProductData) => {
    if (!permissions.canRead) return;
    setSelectedProduct(product);
    setIsViewModalOpen(true);
  };

  const handleAddNew = () => {
    if (!permissions.canWrite) return;
    setSelectedProduct(null); // Nenhum produto selecionado para adição
    setIsEditing(false);
    setIsFormModalOpen(true);
  };

  const handleEdit = (product: ProductData) => {
    if (!permissions.canWrite) return;
    setSelectedProduct(product);
    setIsEditing(true);
    setIsFormModalOpen(true);
  };

  const handleDelete = (product: ProductData) => {
    if (!permissions.canDelete) return;
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsViewModalOpen(false);
    setIsFormModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedProduct(null); // Limpar seleção ao fechar
  };

  // --- Funções de Interação com Backend (Firestore/Storage) ---

  const uploadImage = async (productId: string, imageFile: File): Promise<string> => {
    const imageRef = ref(storage, `products/${productId}_${Date.now()}_${imageFile.name}`);
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

  const handleFormSubmit = async (formData: ProductFormData, imageFile?: File | null) => {
    if (!permissions.canWrite || !adminUser) { // Verificar adminUser e permissão
      throw new Error("Permissão negada ou usuário não autenticado.");
    }

    // Usar adminUser.uid ou currentUser.uid dependendo do que faz sentido para 'lastUpdatedBy'
    // Vamos assumir que o UID do Firebase Auth (currentUser) é o identificador principal
    const userId = currentUser?.uid;
    if (!userId) {
      throw new Error("ID do usuário não encontrado para registrar a atualização.");
    }

    let imageUrl = formData.image; // Manter imagem existente por padrão

    // 1. Upload de nova imagem (se houver)
    if (imageFile) {
      // Deletar imagem antiga ANTES de fazer upload da nova (se estiver editando)
      if (isEditing && selectedProduct?.image) {
        await deleteImage(selectedProduct.image);
      }
      // Fazer upload da nova imagem (usar ID do produto se editando, ou um placeholder se adicionando)
      const tempIdForUpload = formData.id || `new_${Date.now()}`;
      imageUrl = await uploadImage(tempIdForUpload, imageFile);
    }

    const dataToSave = {
      ...formData,
      image: imageUrl, // URL da nova imagem ou a existente
      updatedAt: Timestamp.now(),
      lastUpdatedBy: currentUser.uid,
    };

    if (isEditing && formData.id) {
      // 2. Atualizar Produto Existente
      const productRef = doc(db, 'products', formData.id);
      // Remover 'id' do objeto a ser salvo
      const { ...updateData } = dataToSave;
      await updateDoc(productRef, updateData);
      console.log('Produto atualizado:', formData.id);
    } else {
      // 3. Adicionar Novo Produto
      const saveData = {
        ...dataToSave,
        createdAt: Timestamp.now(),
        createdBy: currentUser.uid,
        timesOrder: 0, // Valores iniciais
        views: 0,
      };
      // Remover 'id' se existir (não deve para novos produtos)
      delete saveData.id;
      const docRef = await addDoc(collection(db, 'products'), saveData);
      console.log('Novo produto adicionado:', docRef.id);
      // Se uma imagem foi carregada para um novo produto, talvez seja necessário atualizar o nome do arquivo ou refazer o upload com o ID real?
      // Por simplicidade, assumimos que o nome com timestamp é suficiente.
    }

    handleCloseModals();
    await fetchData(); // Recarregar dados após salvar
  };

  const handleDeleteConfirm = async () => {
    if (!permissions.canDelete || !selectedProduct || !selectedProduct.id) {
      console.error('Permissão negada ou produto não selecionado para exclusão.');
      handleCloseModals();
      return;
    }

    try {
      // Deletar imagem do Storage primeiro
      await deleteImage(selectedProduct.image);

      // Deletar documento do Firestore
      await deleteDoc(doc(db, 'products', selectedProduct.id));
      console.log('Produto excluído:', selectedProduct.id);
      handleCloseModals();
      await fetchData(); // Recarregar dados
    } catch (err) {
      console.error("Erro ao excluir produto:", err);
      setError('Falha ao excluir produto.');
      // Manter modal aberto para mostrar erro? Ou fechar?
      handleCloseModals(); // Fechar por enquanto
    }
  };

  // --- Renderização ---

  return (
    <div className="admin-container p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl sm:text-2xl font-bold">
          Gerenciamento de Produtos
        </h1>

        {permissions.canWrite && (
          <button
            onClick={handleAddNew}
            className="text-sm sm:text-base bg-[#efb42b] hover:bg-[#d9a326] text-[#333] font-bold py-2 px-3 sm:px-4 rounded shadow"
          >
            + Novo Produto
          </button>
        )}
      </div>


      {loading && <div className="text-center py-4">Carregando...</div>}
      {error && <div className="text-red-500 text-center py-4 bg-red-100 rounded">{error}</div>}

      {!loading && !error && permissions.canRead && (
        <ProductTable
          products={products}
          categoriesMap={categoriesMap}
          permissions={permissions}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
      {!loading && !error && !permissions.canRead && (
        <div className="text-center py-4 text-gray-500">Você não tem permissão para visualizar produtos.</div>
      )}

      {/* Modais */}
      <ViewProductModal
        isOpen={isViewModalOpen}
        onClose={handleCloseModals}
        product={selectedProduct}
        categoriesMap={categoriesMap}
        ingredientsMap={ingredientsMap}
        allergensMap={allergensMap}
        usersMap={usersMap} // Passar o mapa de usuários
      />

      <ProductModal
        isOpen={isFormModalOpen}
        onClose={handleCloseModals}
        title={isEditing ? 'Editar Produto' : 'Adicionar Novo Produto'}
      >
        <ProductForm
          initialData={isEditing ? selectedProduct : null}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseModals}
          categories={categories}
          ingredients={ingredients}
          allergens={allergens}
        />
      </ProductModal>

      <DeleteProductModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseModals}
        onConfirm={handleDeleteConfirm}
        productName={selectedProduct?.productname}
      />

    </div>
  );
};

export default Products;

