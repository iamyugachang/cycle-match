import React from 'react';
import { Alert, Spin } from 'antd';
import TeacherForm from './TeacherForm';
import { Teacher } from '../types';

interface TeacherFormContainerProps {
  onSubmit: (teacher: Teacher) => void;
  defaultEmail?: string;
  loading: boolean;
  error: string;
}

const TeacherFormContainer: React.FC<TeacherFormContainerProps> = ({
  onSubmit,
  defaultEmail,
  loading,
  error
}) => {
  return (
    <>
      {error && <Alert message={error} type="error" style={{ marginBottom: 16 }} />}
      
      <Spin spinning={loading} tip="處理中...">
        <TeacherForm onSubmit={onSubmit} defaultEmail={defaultEmail} />
      </Spin>
    </>
  );
};

export default TeacherFormContainer;