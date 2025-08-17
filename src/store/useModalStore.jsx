import { create } from 'zustand';

export const useModalStore = create((set) => ({
  modal: null,      // Stores the name of the open modal, e.g., 'addCourse'
  props: {},        // Stores any props needed for the modal, like the item to edit
  openModal: (modal, props = {}) => set({ modal, props }),
  closeModal: () => set({ modal: null, props: {} }),
}));