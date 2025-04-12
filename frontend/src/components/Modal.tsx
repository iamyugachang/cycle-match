import React, { ReactNode } from 'react';
import { Modal as AntModal, Button } from 'antd';

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
  // Map our size props to width values
  const widthMap = {
    small: 400,
    medium: 520,
    large: 720
  };

  return (
    <AntModal
      open={isOpen}
      title={title}
      onCancel={onClose}
      width={widthMap[size]}
      centered
      footer={footer || [
        <Button 
          key="close" 
          onClick={onClose} 
          type="primary"
        >
          {closeButtonText}
        </Button>
      ]}
    >
      {children}
    </AntModal>
  );
};

export default Modal;