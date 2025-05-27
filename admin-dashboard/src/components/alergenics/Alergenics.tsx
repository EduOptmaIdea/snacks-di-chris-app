import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../../../../src/firebase'; // Ajustado para o caminho correto
import { useAuth } from '../../context/useAuth'; // Hook de autenticação

// Importar componentes filhos (serão criados/adaptados)
import AlergenicTable from './AlergenicTable';
import AlergenicModal from './AlergenicModal';
import AlergenicForm from './AlergenicForm';
import DeleteAlergenicModal from './DeleteAlergenicModal';
import ViewAlergenicModal from './ViewAlergenicModal';

// Interfaces específicas para Alergenices
interface AlergenicData {
  id: string;
  name?: string;
  createdAt?: Timestamp;
  createdBy?: string;
  updatedAt?: Timestamp;
  lastUpdatedBy?: string;
}

interface AlergenicFormData {
  id?: string;
  name?: string;
}

interface AlergenicPermissions {
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
}

const Alergenics: React.FC = () => {
  const { currentUser, adminUser } = useAuth();
  const [alergenicsData, setAlergenicsData] = useState<AlergenicData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Estado para Modais
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedAlergenic, setSelectedAlergenic] = useState<AlergenicData | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Derivar permissões do usuário logado para alergênicos
  const permissions = React.useMemo<AlergenicPermissions>(() => {
    const userPermissions = adminUser?.permissions?.alergenics || []; // Permissões de alergênicos
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
      setError('Você não tem permissão para visualizar os alergênicos cadastrados.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const alergenicsSnapshot = await getDocs(collection(db, 'allergenicAgentsList'));
      const alergenicsList = alergenicsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as AlergenicData[];
      alergenicsList.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
      setAlergenicsData(alergenicsList);
    } catch (err) {
      console.error("Erro ao buscar alergênicos:", err);
      setError('Falha ao carregar alergênicos. Verifique o console para mais detalhes.');
    } finally {
      setLoading(false);
    }
  }, [permissions.canRead]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Handlers para Ações ---

  const handleView = (alergenic: AlergenicData) => {
    if (!permissions.canRead) return;
    setSelectedAlergenic(alergenic);
    setIsViewModalOpen(true);
  };

  const handleAddNew = () => {
    if (!permissions.canWrite) return;
    setSelectedAlergenic(null);
    setIsEditing(false);
    setIsFormModalOpen(true);
  };

  const handleEdit = (alergenic: AlergenicData) => {
    if (!permissions.canWrite) return;
    setSelectedAlergenic(alergenic);
    setIsEditing(true);
    setIsFormModalOpen(true);
  };

  const handleDelete = (alergenic: AlergenicData) => {
    if (!permissions.canDelete) return;
    setSelectedAlergenic(alergenic);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsViewModalOpen(false);
    setIsFormModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedAlergenic(null);
  };

  // --- Funções de Interação com Backend (Firestore) ---

  const handleFormSubmit = async (formData: AlergenicFormData) => {
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
        // Atualizar alergênico Existente
        const AlergenicRef = doc(db, 'allergenicAgentsList', formData.id);
        const { ...updateData } = dataToSave; // Remover id antes de salvar
        await updateDoc(AlergenicRef, updateData);
        console.log('Alergênico atualizado:', formData.id);
      } else {
        // Adicionar Novo Alergenico
        const saveData = {
          ...dataToSave,
          createdAt: Timestamp.now(),
          createdBy: currentUser.uid,
        };
        delete saveData.id; // Remover id se existir
        const docRef = await addDoc(collection(db, 'allergenicAgentsList'), saveData);
        console.log('Novo alergênico adicionado:', docRef.id);
      }
      handleCloseModals();
      await fetchData(); // Recarregar dados
    } catch (err) {
      console.error("Erro ao salvar alergênico:", err);
      // Extrair mensagem de erro de forma segura
      const errorMessage = err instanceof Error ? err.message : 'Falha ao salvar alergênico.';
      setError(errorMessage); // Exibir erro no formulário ou modal
      throw new Error(errorMessage); // Propagar erro para o formulário tratar
    }
  };

  const handleDeleteConfirm = async () => {
    if (!permissions.canDelete || !selectedAlergenic || !selectedAlergenic.id) {
      console.error('Permissão negada ou alergênico não selecionado para exclusão.');
      handleCloseModals();
      return;
    }

    try {
      await deleteDoc(doc(db, 'allergenicAgentsList', selectedAlergenic.id));
      console.log('Alergênico excluído:', selectedAlergenic.id);
      handleCloseModals();
      await fetchData(); // Recarregar dados
    } catch (err) {
      console.error("Erro ao excluir alergênico:", err);
      setError('Falha ao excluir alergênico.');
      handleCloseModals();
    }
  };

  // --- Renderização ---

  return (
    <div className="admin-container p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Gerenciamento de Agentes Alergênicos</h1>
        {permissions.canWrite && (
          <button
            onClick={handleAddNew}
            className="bg-[#efb42b] hover:bg-[#d9a326] text-[#333] font-bold py-2 px-4 rounded shadow"
          >
            + Novo Agente Alergênico
          </button>
        )}
      </div>

      {loading && <div className="text-center py-4">Carregando...</div>}
      {error && !loading && <div className="text-red-500 text-center py-4 bg-red-100 rounded">{error}</div>}

      {!loading && !error && permissions.canRead && (
        <AlergenicTable
          alergenics={alergenicsData}
          permissions={permissions}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
      {!loading && !error && !permissions.canRead && (
        <div className="text-center py-4 text-gray-500">Você não tem permissão para visualizar os alergênicos.</div>
      )}

      {/* Modais */}
      <ViewAlergenicModal
        isOpen={isViewModalOpen}
        onClose={handleCloseModals}
        alergenic={selectedAlergenic}
      />

      <AlergenicModal
        isOpen={isFormModalOpen}
        onClose={handleCloseModals}
        title={isEditing ? 'Editar Alergênico' : 'Adicionar Novo Alergênico'}
      >
        <AlergenicForm
          initialData={isEditing ? selectedAlergenic : null}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseModals}
        />
      </AlergenicModal>

      <DeleteAlergenicModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseModals}
        onConfirm={handleDeleteConfirm}
        alergenic={selectedAlergenic?.name}
      />

    </div>
  );
};

export default Alergenics;

