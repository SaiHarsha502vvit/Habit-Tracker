import { useDispatch, useSelector } from 'react-redux'

/**
 * Typed hooks for Redux usage throughout the app
 */
export const useAppDispatch = () => useDispatch()
export const useAppSelector = useSelector
