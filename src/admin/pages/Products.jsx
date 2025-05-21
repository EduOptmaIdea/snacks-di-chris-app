import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

function Products() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(list);
    };

    fetchProducts();
  }, []);

  return (
    <div className="admin-container">
      <h1>Produtos</h1>
      <button onClick={() => alert('Ir para formulário de novo produto')}>+ Novo Produto</button>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Categoria</th>
            <th>Preço</th>
            <th>Estoque</th>
            <th>Disponível</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.productname}</td>
              <td>{p.category || p.categoria}</td>
              <td>R$ {p.price?.toFixed(2)}</td>
              <td>{p.currentStock ?? 0}</td>
              <td>{p.available ? 'Sim' : 'Não'}</td>
              <td>
                <button onClick={() => alert(`Editar ${p.id}`)}>Editar</button>
                <button onClick={() => alert(`Excluir ${p.id}`)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Products;