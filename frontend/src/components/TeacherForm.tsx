import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Select, Card, Typography, Row, Col, Divider } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { Teacher } from '../types';
import { fetchLocations, getAllCounties, getDistrictsByCounty } from '../utils';
import { fetchSubjects } from '../utils/subjectUtils';

const { Title, Text } = Typography;
const { Option } = Select;

interface TeacherFormProps {
  onSubmit: (teacher: Teacher) => void;
  defaultEmail?: string;
  initialData?: Teacher; // For edit mode
  isEditing?: boolean;
  form?: any; // Optional form prop to allow parent components to control the form
}

const TeacherForm: React.FC<TeacherFormProps> = ({ 
  onSubmit, 
  defaultEmail = "", 
  initialData, 
  isEditing = false,
  form: externalForm 
}) => {
  // Use the external form if provided, otherwise create a new one
  const [internalForm] = Form.useForm();
  const form = externalForm || internalForm;
  
  const currentYear = new Date().getFullYear() - 1911;
  
  // Add state for locations and subjects
  const [locations, setLocations] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  // For districts that depend on county selection
  const [countyDistrictsMap, setCountyDistrictsMap] = useState<{[key: string]: string[]}>({});
  const [targetDistrictOptions, setTargetDistrictOptions] = useState<{[key: number]: string[]}>({});
  // Add new state for current school district options
  const [currentDistrictOptions, setCurrentDistrictOptions] = useState<string[]>([]);

  // Load locations and subjects when component mounts
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load locations
        const locationsData = await fetchLocations();
        setLocations(locationsData);
        
        // Create county-districts map
        const districtsMap: {[key: string]: string[]} = {};
        locationsData.forEach(county => {
          districtsMap[county.name] = county.districts.map(d => d.name);
        });
        setCountyDistrictsMap(districtsMap);
        
        // Load subjects
        const subjectsData = await fetchSubjects();
        setSubjects(subjectsData);
        
        // Set initial form values if editing
        if (initialData) {
          // Transform the targets array for Form.List
          const targets = initialData.target_counties.map((county, index) => ({
            county,
            district: initialData.target_districts[index] || ''
          }));
          
          form.setFieldsValue({
            email: initialData.email,
            current_county: initialData.current_county,
            current_district: initialData.current_district,
            current_school: initialData.current_school,
            subject: initialData.subject,
            targets: targets.length > 0 ? targets : [{ county: '', district: '' }]
          });
          
          // Set district options for each target
          const targetOptions: {[key: number]: string[]} = {};
          initialData.target_counties.forEach((county, index) => {
            if (county && districtsMap[county]) {
              targetOptions[index] = districtsMap[county];
            }
          });
          setTargetDistrictOptions(targetOptions);
          
          // Set current district options based on initial county
          if (initialData.current_county && districtsMap[initialData.current_county]) {
            setCurrentDistrictOptions(districtsMap[initialData.current_county]);
          }
        } else if (defaultEmail) {
          form.setFieldsValue({ 
            email: defaultEmail,
            targets: [{ county: '', district: '' }]
          });
        } else {
          form.setFieldsValue({
            targets: [{ county: '', district: '' }]
          });
        }
      } catch (error) {
        console.error("Failed to load form data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [initialData, defaultEmail, form]);

  // Handle county change to update district options
  const handleCurrentCountyChange = (value: string) => {
    // Clear the district field
    form.setFieldsValue({ current_district: undefined });
    
    // Set the district options for current county
    if (value && countyDistrictsMap[value]) {
      setCurrentDistrictOptions(countyDistrictsMap[value]);
    } else {
      setCurrentDistrictOptions([]);
    }
  };

  const handleTargetCountyChange = (value: string, index: number) => {
    // Clear the district when county changes
    const targets = form.getFieldValue('targets');
    if (targets && targets[index]) {
      targets[index].district = undefined;
      form.setFieldsValue({ targets });
    }
    
    // Update available districts for this target
    if (value && countyDistrictsMap[value]) {
      setTargetDistrictOptions(prev => ({
        ...prev,
        [index]: countyDistrictsMap[value]
      }));
    }
  };

  const handleFinish = (values: any) => {
    // Transform form values to match Teacher interface
    const teacherData: Teacher = {
      id: initialData?.id,
      email: values.email,
      current_county: values.current_county,
      current_district: values.current_district,
      current_school: values.current_school,
      subject: values.subject,
      target_counties: values.targets?.map((t: any) => t.county) || [],
      target_districts: values.targets?.map((t: any) => t.district) || [],
      google_id: initialData?.google_id,
      year: currentYear,
    };
    
    onSubmit(teacherData);
  };

  const counties = locations.map(county => county.name);
    
  return (
    <Card title={
      <Title level={4}>
        {isEditing ? `編輯 ${currentYear} 年度介聘資料` : `登記 ${currentYear} 年度介聘資料`}
      </Title>
    }>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        disabled={loading}
        style={{ width: '100%' }}
      >
        <Divider orientation="left">現職學校</Divider>
        
        {/* Current School Information */}
        <Row gutter={[24, 0]}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="current_county"
              label="縣市"
              rules={[{ required: true, message: '請選擇縣市' }]}
            >
              <Select 
                placeholder="請選擇縣市" 
                onChange={handleCurrentCountyChange}
                showSearch
                style={{ width: '100%' }}
              >
                {counties.map(county => (
                  <Option key={county} value={county}>{county}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={12}>
            <Form.Item
              name="current_district"
              label="區域"
              rules={[{ required: true, message: '請選擇區域' }]}
            >
              <Select 
                placeholder="請選擇區域" 
                disabled={!form.getFieldValue('current_county')}
                showSearch
                style={{ width: '100%' }}
              >
                {currentDistrictOptions.map(district => (
                  <Option key={district} value={district}>{district}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={[24, 0]}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="current_school"
              label="學校名稱"
              rules={[{ required: true, message: '請輸入學校名稱' }]}
            >
              <Input placeholder="例如：大安國小、板橋國小" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={12}>
            <Form.Item
              name="subject"
              label="任教科目"
            >
              <Select 
                placeholder="請選擇科目" 
                showSearch
                style={{ width: '100%' }}
              >
                {subjects.map(subject => (
                  <Option key={subject} value={subject}>{subject}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        
        <Divider orientation="left">希望調往地區</Divider>
        <Form.List name="targets">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field) => (
                <Card 
                  key={field.key} 
                  title={`調動選項 ${field.name + 1}`}
                  style={{ marginBottom: 16 }}
                  size="small"
                  extra={
                    fields.length > 1 ? (
                      <Button 
                        type="text" 
                        danger 
                        icon={<MinusCircleOutlined />} 
                        onClick={() => remove(field.name)}
                      >
                        移除
                      </Button>
                    ) : null
                  }
                >
                  <Row gutter={[24, 0]}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name={[field.name, 'county']}
                        label="希望調往縣市"
                        rules={[{ required: true, message: '請選擇縣市' }]}
                      >
                        <Select 
                          placeholder="請選擇縣市" 
                          onChange={(value) => handleTargetCountyChange(value, field.name)}
                          showSearch
                          style={{ width: '100%' }}
                        >
                          {counties.map(county => (
                            <Option key={`${field.key}-${county}`} value={county}>{county}</Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name={[field.name, 'district']}
                        label="希望調往區域"
                        rules={[{ required: true, message: '請選擇區域' }]}
                      >
                        <Select 
                          placeholder="請選擇區域" 
                          disabled={!form.getFieldValue(['targets', field.name, 'county'])}
                          showSearch
                          style={{ width: '100%' }}
                        >
                          {targetDistrictOptions[field.name]?.map(district => (
                            <Option key={`${field.key}-${district}`} value={district}>{district}</Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              ))}
              <Form.Item>
                <Button 
                  type="dashed" 
                  onClick={() => add({ county: '', district: '' })} 
                  block 
                  icon={<PlusOutlined />}
                >
                  新增希望調往的地區
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
        
        <Divider />
        
        <Form.Item
          name="email"
          label="電子郵件"
          rules={[
            { required: true, message: '請輸入電子郵件' },
            { type: 'email', message: '請輸入有效的電子郵件' }
          ]}
        >
          <Input placeholder="例如：example@example.com" style={{ width: '100%' }} />
        </Form.Item>
        
        <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
          僅供教師間聯絡，本站不會做任何用途。為了安全考量，建議使用 Email 取代 Line 或即時通訊軟體。
        </Text>
        
        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            block 
            size="large"
            loading={loading}
          >
            {isEditing ? "更新介聘資料" : "送出介聘資料"}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default TeacherForm;