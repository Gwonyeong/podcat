import { create } from "zustand";

interface ApplicationFormData {
  name: string;
  phoneNumber: string;
  interestedTopics: string[];
  privacyConsent: boolean;
  marketingConsent: boolean;
}

interface ModalStore {
  isApplicationModalOpen: boolean;
  formData: ApplicationFormData;
  isSubmitting: boolean;
  openApplicationModal: () => void;
  closeApplicationModal: () => void;
  updateFormData: (data: Partial<ApplicationFormData>) => void;
  resetFormData: () => void;
  setSubmitting: (isSubmitting: boolean) => void;
}

const initialFormData: ApplicationFormData = {
  name: "",
  phoneNumber: "",
  interestedTopics: [],
  privacyConsent: false,
  marketingConsent: false,
};

export const useModalStore = create<ModalStore>((set) => ({
  isApplicationModalOpen: false,
  formData: initialFormData,
  isSubmitting: false,
  openApplicationModal: () => set({ isApplicationModalOpen: true }),
  closeApplicationModal: () =>
    set({
      isApplicationModalOpen: false,
      formData: initialFormData,
    }),
  updateFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),
  resetFormData: () => set({ formData: initialFormData }),
  setSubmitting: (isSubmitting) => set({ isSubmitting }),
}));
