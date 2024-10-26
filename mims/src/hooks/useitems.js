import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchItems, addItem as addItemApi, updateItem as updateItemApi, deleteItem as deleteItemApi } from '../service/api'; // Updated path to api.js
import { useItemsStore } from '../store/itemsStore';

export const useItems = () => {
  const queryClient = useQueryClient();
  const { setItems, addItem, removeItem, updateItem } = useItemsStore();

  // Fetch items
  const { data: items, refetch } = useQuery(['items'], fetchItems, {
    onSuccess: (data) => {
      setItems(data);
    },
  });

  // Add item
  const addItemMutation = useMutation({
    mutationFn: addItemApi,
    onSuccess: (newItem) => {
      addItem(newItem);
      queryClient.invalidateQueries(['items']);
    },
  });

  // Update item
  const updateItemMutation = useMutation({
    mutationFn: updateItemApi,
    onSuccess: (updatedItem) => {
      updateItem(updatedItem);
      queryClient.invalidateQueries(['items']);
    },
  });

  // Delete item
  const deleteItemMutation = useMutation({
    mutationFn: deleteItemApi,
    onSuccess: (itemId) => {
      removeItem(itemId);
      queryClient.invalidateQueries(['items']);
    },
  });

  return {
    items,
    refetchItems: refetch,
    addItemMutation,
    updateItemMutation,
    deleteItemMutation,
  };
};
