import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../stores/store'; // Assurez-vous que le chemin est correct

// Utilisez ces hooks typés dans toute votre application au lieu de `useDispatch` et `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;