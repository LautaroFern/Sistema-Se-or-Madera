import { ReactNode } from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative bg-white dark:bg-madera-900 rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-4 border-b border-madera-200 dark:border-madera-700">
              <h2 className="text-lg font-semibold text-madera-800 dark:text-madera-100">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-madera-100 dark:hover:bg-madera-800 transition-colors"
              >
                <X className="w-5 h-5 text-madera-500" />
              </button>
            </div>
            <div className="p-4">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}