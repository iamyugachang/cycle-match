import React, { ReactNode } from 'react';
import '../styles/components/Modal.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'small' | 'medium' | 'large';
  footer?: ReactNode;
  closeButtonText?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  footer,
  closeButtonText = '關閉'
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => {
      // Close when clicking the overlay (outside the modal)
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className={`modal-container ${size}`} onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-header">{title}</h3>
        
        <div className="modal-content">
          {children}
        </div>
        
        <div className="modal-footer">
          {footer || (
            <button 
              onClick={onClose}
              className="modal-close-btn"
            >
              {closeButtonText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;